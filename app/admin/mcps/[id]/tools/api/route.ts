import { NextRequest, NextResponse } from 'next/server';
import {
  getMCPTools,
  createMCPTool,
  updateMCPTool,
  deleteMCPTool,
} from '@/app/admin/mcps/tools-actions';
import { MCPToolFormData } from '@/lib/types/mcp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tools = await getMCPTools(id);
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: MCPToolFormData = await request.json();
    const tool = await createMCPTool(id, body);
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tool' },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mcpId } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mcpId) {
      return NextResponse.json(
        { error: 'Tool ID and MCP ID are required' },
        { status: 400 }
      );
    }

    const body: MCPToolFormData = await request.json();
    const tool = await updateMCPTool(id, mcpId, body);
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tool' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mcpId } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mcpId) {
      return NextResponse.json(
        { error: 'Tool ID and MCP ID are required' },
        { status: 400 }
      );
    }

    await deleteMCPTool(id, mcpId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete tool' },
      { status: 400 }
    );
  }
}
