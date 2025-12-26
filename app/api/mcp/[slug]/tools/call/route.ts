import { NextRequest, NextResponse } from 'next/server';
import { getMCPToolMapping } from '@/app/admin/mcps/mcp-actions';
import { transformToolArgsToAPIPayload } from '@/lib/mcp/transformer';
import { callMappedAPI } from '@/lib/mcp/api-client';
import { MCPCallToolRequest, MCPCallToolResponse, JSONRPCRequest, JSONRPCResponse } from '@/lib/mcp/protocol';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: JSONRPCRequest = await request.json();
    
    // Check if method is tools/call
    if (body.method && body.method !== 'tools/call') {
      const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: errorId,
        error: {
          code: -32601,
          message: `Method not found: ${body.method}`,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Extract tool call request from params
    const toolRequest = body.params as MCPCallToolRequest;

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
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get tool with its mapping and API
    const toolData = await getMCPToolMapping(slug, toolRequest.name);

    if (!toolData) {
      const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: errorId,
        error: {
          code: 404,
          message: `Tool "${toolRequest.name}" not found in MCP "${slug}"`,
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const { tool, mapping, api } = toolData;

    // If no mapping exists, return error
    if (!mapping || !api) {
      const errorId = body.id !== null && body.id !== undefined ? body.id : '1';
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: errorId,
        error: {
          code: 400,
          message: `Tool "${toolRequest.name}" has no API mapping configured`,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Transform tool arguments to API payload
    const apiPayload = transformToolArgsToAPIPayload(
      toolRequest.arguments || {},
      mapping.mapping_config
    );

    // Call the mapped API
    const apiResponse = await callMappedAPI(api, {
      payload: apiPayload,
    });

    // Transform API response to MCP tool response format
    const mcpResult: MCPCallToolResponse = {
      content: [
        {
          type: 'text',
          text: typeof apiResponse.data === 'string'
            ? apiResponse.data
            : JSON.stringify(apiResponse.data, null, 2),
        },
      ],
      isError: apiResponse.status >= 400,
    };

    const responseId = body.id !== null && body.id !== undefined ? body.id : '1';
    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: responseId,
      result: mcpResult,
    };

    // Return appropriate status code
    const statusCode = apiResponse.status >= 400 ? apiResponse.status : 200;

    return NextResponse.json(response, { status: statusCode });
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
