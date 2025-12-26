import { NextRequest, NextResponse } from 'next/server';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { getMCPToolsBySlug, getMCPToolMapping } from '@/app/admin/mcps/mcp-actions';
import { transformToolArgsToAPIPayload } from '@/lib/mcp/transformer';
import { callMappedAPI } from '@/lib/mcp/api-client';
import { getDynamicCapabilities } from '@/lib/mcp/capabilities';
import { validateAndNormalizeInputSchema } from '@/lib/mcp/schema-validator';
import { trackToolUsage } from '@/lib/mcp/statistics';
import { 
  MCPInitializeRequest,
  MCPInitializeResponse, 
  JSONRPCRequest, 
  JSONRPCResponse,
  MCPToolsListResponse,
  MCPTool as MCPProtocolTool,
  MCPCallToolRequest,
  MCPCallToolResponse,
  MCPResourcesListResponse,
  MCPResource as MCPProtocolResource,
  MCPReadResourceRequest,
  MCPReadResourceResponse,
} from '@/lib/mcp/protocol';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: JSONRPCRequest = await request.json().catch(() => ({} as JSONRPCRequest));

    // Verify MCP exists
    const mcp = await getMCPBySlug(slug);
    if (!mcp) {
      const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: errorId,
        error: {
          code: 404,
          message: `MCP with slug "${slug}" not found`,
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if this is a notification (no id field or id is null)
    const isNotification = body.id === null || body.id === undefined;

    // Handle different methods
    if (body.method === 'initialize') {
      const initParams = body.params as MCPInitializeRequest;
      
      // Get dynamic capabilities based on what's configured
      // Tools are now used as both tools and resources
      const tools = await getMCPToolsBySlug(slug).catch(() => []);
      
      const capabilities = await getDynamicCapabilities(tools);
      
      // Return MCP server initialization response in JSON-RPC format
      const initResponse: MCPInitializeResponse = {
        protocolVersion: '2024-11-05', // MCP protocol version
        capabilities,
        serverInfo: {
          name: mcp.name,
          version: '1.0.0',
        },
      };

      // Ensure id is never null - use a default if not provided
      const responseId = body.id !== null && body.id !== undefined ? body.id : '1';

      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: responseId,
        result: initResponse,
      };

      return NextResponse.json(response);
    }

    // Handle tools/list
    if (body.method === 'tools/list') {
      const tools = await getMCPToolsBySlug(slug);
      const mcpTools: MCPProtocolTool[] = tools.map((tool) => {
        // Validate and normalize input schema
        const validation = validateAndNormalizeInputSchema(tool.input_schema);
        const inputSchema = validation.normalized;

        return {
          name: tool.name,
          description: tool.description || undefined,
          inputSchema,
        };
      });

      const result: MCPToolsListResponse = {
        tools: mcpTools,
      };

      const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: responseId,
        result,
      };

      return NextResponse.json(response);
    }

    // Handle tools/call
    if (body.method === 'tools/call') {
      const toolRequest = body.params as MCPCallToolRequest;
      const startTime = Date.now();
      const clientIp = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';

      if (!toolRequest?.name) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: 400,
            message: 'Tool name is required',
          },
        };
        // Track failed call (no tool data available)
        const mcp = await getMCPBySlug(slug);
        if (mcp) {
          trackToolUsage({
            mcpToolId: '', // No tool ID available
            mcpId: mcp.id,
            toolName: toolRequest?.name || 'unknown',
            requestArguments: toolRequest?.arguments || {},
            success: false,
            responseStatus: 400,
            responseTimeMs: Date.now() - startTime,
            errorMessage: 'Tool name is required',
            clientIp,
          });
        }
        return NextResponse.json(errorResponse, { status: 400 });
      }

      const toolData = await getMCPToolMapping(slug, toolRequest.name);

      if (!toolData) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: -32601, // Method not found (MCP protocol error code)
            message: `Tool "${toolRequest.name}" not found in MCP "${slug}"`,
          },
        };
        // Track failed call (tool not found)
        const mcp = await getMCPBySlug(slug);
        if (mcp) {
          trackToolUsage({
            mcpToolId: '', // No tool ID available
            mcpId: mcp.id,
            toolName: toolRequest.name,
            requestArguments: toolRequest.arguments || {},
            success: false,
            responseStatus: 404,
            responseTimeMs: Date.now() - startTime,
            errorMessage: `Tool "${toolRequest.name}" not found in MCP "${slug}"`,
            clientIp,
          });
        }
        return NextResponse.json(errorResponse, { status: 404 });
      }

      const { tool, mapping, api } = toolData;

      // Validate and normalize input schema FIRST
      const schemaValidation = validateAndNormalizeInputSchema(tool.input_schema);
      const normalizedSchema = schemaValidation.normalized;
      
      // Check if tool has input parameters defined
      const hasProperties = normalizedSchema?.properties && Object.keys(normalizedSchema.properties).length > 0;

      if (!mapping || !api) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: -32603, // Internal error (tool not properly configured)
            message: `Tool "${toolRequest.name}" has no API mapping configured. Please configure the mapping in the admin panel at /admin/mcps/${slug}`,
            data: {
              toolId: tool.id,
              toolName: tool.name,
              inputSchema: normalizedSchema,
            },
          },
        };
        // Track failed call (no mapping configured)
        trackToolUsage({
          mcpToolId: tool.id,
          mcpId: tool.mcp_id,
          toolName: toolRequest.name,
          requestArguments: toolRequest.arguments || {},
          success: false,
          responseStatus: 400,
          responseTimeMs: Date.now() - startTime,
          errorMessage: `Tool "${toolRequest.name}" has no API mapping configured`,
          clientIp,
        });
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // If tool has required parameters but no arguments provided, return error
      if (hasProperties) {
        const requiredFields = normalizedSchema.required || [];
        const providedArgs = toolRequest.arguments || {};
        const providedArgKeys = Object.keys(providedArgs);
        
        // Check if required fields are missing
        if (requiredFields.length > 0) {
          const missingRequired = requiredFields.filter(
            (field: string) => !providedArgKeys.includes(field)
          );
          if (missingRequired.length > 0) {
            const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
            const errorResponse: JSONRPCResponse = {
              jsonrpc: '2.0',
              id: errorId,
              error: {
                code: -32602, // Invalid params
                message: `Tool "${toolRequest.name}" requires the following parameters: ${missingRequired.join(', ')}. Available parameters: ${Object.keys(normalizedSchema.properties).join(', ')}`,
                data: {
                  required: missingRequired,
                  available: Object.keys(normalizedSchema.properties),
                  schema: normalizedSchema,
                },
              },
            };
            // Track failed call (missing required params)
            trackToolUsage({
              mcpToolId: tool.id,
              mcpId: tool.mcp_id,
              toolName: toolRequest.name,
              requestArguments: toolRequest.arguments || {},
              success: false,
              responseStatus: 400,
              responseTimeMs: Date.now() - startTime,
              errorMessage: `Missing required parameters: ${missingRequired.join(', ')}`,
              apiId: api?.id,
              clientIp,
            });
            return NextResponse.json(errorResponse, { status: 400 });
          }
        }
      }

      // Validate arguments against schema if properties exist
      if (hasProperties && toolRequest.arguments) {
        const schemaProperties = normalizedSchema.properties;
        const providedArgs = Object.keys(toolRequest.arguments);
        const schemaFields = Object.keys(schemaProperties);
        
        // Check for unknown arguments
        const unknownArgs = providedArgs.filter(arg => !schemaFields.includes(arg));
        if (unknownArgs.length > 0) {
          const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
          const errorResponse: JSONRPCResponse = {
            jsonrpc: '2.0',
            id: errorId,
            error: {
              code: -32602, // Invalid params
              message: `Tool "${toolRequest.name}" received unknown arguments: ${unknownArgs.join(', ')}. Expected: ${schemaFields.join(', ') || 'none'}`,
              data: {
                received: unknownArgs,
                expected: schemaFields,
                schema: normalizedSchema,
              },
            },
          };
          // Track failed call (unknown arguments)
          trackToolUsage({
            mcpToolId: tool.id,
            mcpId: tool.mcp_id,
            toolName: toolRequest.name,
            requestArguments: toolRequest.arguments || {},
            success: false,
            responseStatus: 400,
            responseTimeMs: Date.now() - startTime,
            errorMessage: `Unknown arguments: ${unknownArgs.join(', ')}`,
            apiId: api.id,
            clientIp,
          });
          return NextResponse.json(errorResponse, { status: 400 });
        }
      }
      
      // If tool doesn't accept parameters but arguments were provided
      if (!hasProperties && toolRequest.arguments && Object.keys(toolRequest.arguments).length > 0) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: -32602, // Invalid params (MCP protocol error code)
            message: `Tool "${toolRequest.name}" does not accept parameters. The input schema has no properties defined. Please configure the tool's input schema in the admin panel.`,
            data: {
              providedArguments: Object.keys(toolRequest.arguments),
              toolSchema: tool.input_schema,
            },
          },
        };
        // Track failed call (tool doesn't accept params)
        trackToolUsage({
          mcpToolId: tool.id,
          mcpId: tool.mcp_id,
          toolName: toolRequest.name,
          requestArguments: toolRequest.arguments || {},
          success: false,
          responseStatus: 400,
          responseTimeMs: Date.now() - startTime,
          errorMessage: 'Tool does not accept parameters',
          apiId: api.id,
          clientIp,
        });
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Ensure we use the provided arguments (or empty object if none)
      const toolArguments = toolRequest.arguments || {};
      
      // Log for debugging
      console.log(`[MCP Tool Call] Tool: ${toolRequest.name}, Arguments:`, toolArguments);
      console.log(`[MCP Tool Call] Tool Schema:`, normalizedSchema);
      
      const apiPayload = transformToolArgsToAPIPayload(
        toolArguments,
        mapping.mapping_config
      );
      
      console.log(`[MCP Tool Call] Transformed Payload:`, apiPayload);

      const apiResponse = await callMappedAPI(api, {
        payload: apiPayload,
      });
      
      const responseTime = Date.now() - startTime;
      const isSuccess = apiResponse.status >= 200 && apiResponse.status < 300;
      
      console.log(`[MCP Tool Call] API Response Status:`, apiResponse.status);
      console.log(`[MCP Tool Call] API Response Data:`, apiResponse.data);

      // Track tool usage (both success and failure)
      trackToolUsage({
        mcpToolId: tool.id,
        mcpId: tool.mcp_id,
        toolName: toolRequest.name,
        requestArguments: toolArguments,
        success: isSuccess,
        responseStatus: apiResponse.status,
        responseTimeMs: responseTime,
        apiId: api.id,
        errorMessage: !isSuccess ? (apiResponse.data?.message || `HTTP ${apiResponse.status}`) : null,
        clientIp,
      });

      // Return the full API response as a proxy
      // Always return the complete API response including status, headers, and data
      const fullResponse = {
        status: apiResponse.status,
        statusText: isSuccess ? 'OK' : 'Error',
        headers: apiResponse.headers,
        data: apiResponse.data,
      };

      const mcpResult: MCPCallToolResponse = {
        content: [
          {
            type: 'text',
            // Return the complete API response as JSON
            text: JSON.stringify(fullResponse, null, 2),
          },
        ],
        isError: !isSuccess,
      };

      const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: responseId,
        result: mcpResult,
      };

      const statusCode = apiResponse.status >= 400 ? apiResponse.status : 200;
      return NextResponse.json(response, { status: statusCode });
    }

    // Handle resources/list
    if (body.method === 'resources/list') {
      // Tools are now used as resources - return all tools as resources
      const tools = await getMCPToolsBySlug(slug);
      
      const mcpResources: MCPProtocolResource[] = tools.map((tool) => {
        const resourceData: MCPProtocolResource = {
          uri: tool.uri,
          name: tool.name,
          description: tool.description || undefined,
          mimeType: 'application/json', // Default MIME type for tool-based resources
        };
        
        // Include the tool's input schema as params
        const validation = validateAndNormalizeInputSchema(tool.input_schema);
        resourceData.params = validation.normalized;
        
        return resourceData;
      });

      const result: MCPResourcesListResponse = {
        resources: mcpResources,
      };

      const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: responseId,
        result,
      };

      return NextResponse.json(response);
    }

    // Handle resources/read
    if (body.method === 'resources/read') {
      const resourceRequest = body.params as MCPReadResourceRequest;

      if (!resourceRequest?.uri) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: -32602, // Invalid params
            message: 'Resource URI is required',
          },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Find tool by URI (tools are now resources)
      const tools = await getMCPToolsBySlug(slug);
      const tool = tools.find(t => t.uri === resourceRequest.uri);

      if (!tool) {
        const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
        const errorResponse: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: errorId,
          error: {
            code: -32601, // Method not found (resource not found)
            message: `Resource with URI "${resourceRequest.uri}" not found`,
          },
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }

      // Use the tool to fetch data via API if params are provided
      if (resourceRequest.params) {
        // Validate parameters against tool's input schema
        const schemaValidation = validateAndNormalizeInputSchema(tool.input_schema);
        const normalizedSchema = schemaValidation.normalized;
        
        const providedParams = Object.keys(resourceRequest.params);
        const schemaFields = Object.keys(normalizedSchema.properties || {});
        
        // Check for unknown parameters
        const unknownParams = providedParams.filter(param => !schemaFields.includes(param));
        if (unknownParams.length > 0) {
          const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
          const errorResponse: JSONRPCResponse = {
            jsonrpc: '2.0',
            id: errorId,
            error: {
              code: -32602, // Invalid params
              message: `Resource "${resourceRequest.uri}" received unknown parameters: ${unknownParams.join(', ')}. Expected: ${schemaFields.join(', ') || 'none'}`,
            },
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        // Check required fields
        if (normalizedSchema.required && Array.isArray(normalizedSchema.required)) {
          const missingRequired = normalizedSchema.required.filter(
            (field: string) => !providedParams.includes(field)
          );
          if (missingRequired.length > 0) {
            const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
            const errorResponse: JSONRPCResponse = {
              jsonrpc: '2.0',
              id: errorId,
              error: {
                code: -32602, // Invalid params
                message: `Resource "${resourceRequest.uri}" requires the following parameters: ${missingRequired.join(', ')}`,
              },
            };
            return NextResponse.json(errorResponse, { status: 400 });
          }
        }

        // Get tool mapping and call API
        const toolMapping = await getMCPToolMapping(slug, tool.name);
        
        if (!toolMapping || !toolMapping.mapping || !toolMapping.api) {
          const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
          const errorResponse: JSONRPCResponse = {
            jsonrpc: '2.0',
            id: errorId,
            error: {
              code: -32603, // Internal error
              message: `Resource "${resourceRequest.uri}" (tool "${tool.name}") has no API mapping configured. Please configure the mapping in the admin panel.`,
            },
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }

        // Transform parameters to API payload
        const apiPayload = transformToolArgsToAPIPayload(
          resourceRequest.params,
          toolMapping.mapping.mapping_config
        );

        // Call the API
        const apiResponse = await callMappedAPI(toolMapping.api, {
          payload: apiPayload,
        });

        // Return the full API response as a proxy
        // Always return the complete API response including status, headers, and data
        const fullResponse = {
          status: apiResponse.status,
          statusText: apiResponse.status >= 200 && apiResponse.status < 300 ? 'OK' : 'Error',
          headers: apiResponse.headers,
          data: apiResponse.data,
        };

        // Return API response as resource content
        const result: MCPReadResourceResponse = {
          contents: [
            {
              uri: tool.uri,
              mimeType: 'application/json',
              text: JSON.stringify(fullResponse, null, 2),
            },
          ],
        };

        const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
        const response: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: responseId,
          result,
        };

        const statusCode = apiResponse.status >= 400 ? apiResponse.status : 200;
        return NextResponse.json(response, { status: statusCode });
      }

      // If no params provided, return tool description
      const result: MCPReadResourceResponse = {
        contents: [
          {
            uri: tool.uri,
            mimeType: 'application/json',
            text: tool.description || tool.name,
          },
        ],
      };

      const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: responseId,
        result,
      };

      return NextResponse.json(response);
    }

    // Handle notifications (no response needed)
    if (isNotification) {
      if (body.method === 'notifications/initialized') {
        // Accept the notification silently
        return new NextResponse(null, { status: 200 });
      }
      // Other notifications - accept silently
      return new NextResponse(null, { status: 200 });
    }

    // Unknown method (only for requests with id)
    const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
    const errorResponse: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: errorId,
      error: {
        code: -32601,
        message: `Method not found: ${body.method || 'unknown'}`,
      },
    };
    return NextResponse.json(errorResponse, { status: 400 });
  } catch (error) {
    const errorResponse: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: '1', // Default id for error cases
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
