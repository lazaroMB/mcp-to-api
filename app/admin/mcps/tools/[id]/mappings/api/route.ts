import { NextRequest, NextResponse } from 'next/server';
import {
  getToolMappings,
  createMapping,
  updateMapping,
  deleteMapping,
} from '@/app/admin/mcps/tool-mapping-actions';
import { MappingFormData } from '@/lib/types/mapping';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mappings = await getToolMappings(id);
    return NextResponse.json(mappings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch mappings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: toolId } = await params;
    const body: MappingFormData = await request.json();
    const mapping = await createMapping(toolId, body);
    return NextResponse.json(mapping, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create mapping' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const urlParts = request.url.split('/');
    const toolIdIndex = urlParts.indexOf('tools');
    const toolId = toolIdIndex >= 0 ? urlParts[toolIdIndex + 1] : null;

    if (!id || !toolId) {
      return NextResponse.json(
        { error: 'Mapping ID and Tool ID are required' },
        { status: 400 }
      );
    }

    const body: MappingFormData = await request.json();
    const mapping = await updateMapping(id, toolId, body);
    return NextResponse.json(mapping);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update mapping' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const urlParts = request.url.split('/');
    const toolIdIndex = urlParts.indexOf('tools');
    const toolId = toolIdIndex >= 0 ? urlParts[toolIdIndex + 1] : null;

    if (!id || !toolId) {
      return NextResponse.json(
        { error: 'Mapping ID and Tool ID are required' },
        { status: 400 }
      );
    }

    await deleteMapping(id, toolId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete mapping' },
      { status: 400 }
    );
  }
}
