import { NextRequest, NextResponse } from 'next/server';
import { getMCPToolsBySlug } from '@/app/admin/mcps/mcp-actions';
import { MCPToolsListResponse, MCPTool as MCPProtocolTool, JSONRPCRequest, JSONRPCResponse } from '@/lib/mcp/protocol';
import { validateAndNormalizeInputSchema } from '@/lib/mcp/schema-validator';

async function handleToolsList(
  request: NextRequest,
  params: Promise<{ slug: string }>,
  body?: JSONRPCRequest
) {
  try {
    const { slug } = await params;

    // Check if this is a notification (no id field or id is null)
    const isNotification = body && (body.id === null || body.id === undefined);

    // This endpoint handles tools/list - always return the tools list
    // Accept tools/list method, no method (GET), or handle notifications
    if (body && body.method && body.method !== 'tools/list') {
      // If it's a notification with different method, accept silently
      if (isNotification) {
        return new NextResponse(null, { status: 200 });
      }
      // For requests with different methods, still return tools list
      // (this endpoint only handles tools/list, so we'll be permissive)
    }

    // Get tools for this MCP (for both GET and POST with tools/list)
    const tools = await getMCPToolsBySlug(slug);

    // Transform to MCP protocol format
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

    const responseId = body?.id !== null && body?.id !== undefined ? body.id : '1';
    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: responseId,
      result,
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorId = body?.id !== null && body?.id !== undefined ? body.id : '1';
    const errorResponse: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: errorId,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleToolsList(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const body: JSONRPCRequest = await request.json().catch(() => ({} as JSONRPCRequest));
  return handleToolsList(request, params, body);
}
