import { NextRequest, NextResponse } from 'next/server';
import {
  getMCPResources,
  createMCPResource,
  updateMCPResource,
  deleteMCPResource,
} from '@/app/admin/mcps/tools-actions';
import { MCPResourceFormData } from '@/lib/types/mcp';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resources = await getMCPResources(id);
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch resources' },
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
    const body: MCPResourceFormData = await request.json();
    const resource = await createMCPResource(id, body);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create resource' },
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
        { error: 'Resource ID and MCP ID are required' },
        { status: 400 }
      );
    }

    const body: MCPResourceFormData = await request.json();
    const resource = await updateMCPResource(id, mcpId, body);
    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update resource' },
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
        { error: 'Resource ID and MCP ID are required' },
        { status: 400 }
      );
    }

    await deleteMCPResource(id, mcpId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete resource' },
      { status: 400 }
    );
  }
}
