import { NextRequest, NextResponse } from 'next/server';
import { getMCPs, createMCP, updateMCP, deleteMCP } from '../actions';
import { MCPFormData } from '@/lib/types/mcp';

export async function GET() {
  try {
    const mcps = await getMCPs();
    return NextResponse.json(mcps);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch MCPs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MCPFormData = await request.json();
    const mcp = await createMCP(body);
    return NextResponse.json(mcp, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create MCP' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MCP ID is required' }, { status: 400 });
    }

    const body: MCPFormData = await request.json();
    const mcp = await updateMCP(id, body);
    return NextResponse.json(mcp);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update MCP' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'MCP ID is required' }, { status: 400 });
    }

    await deleteMCP(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete MCP' },
      { status: 400 }
    );
  }
}
