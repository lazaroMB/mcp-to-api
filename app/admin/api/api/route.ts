import { NextRequest, NextResponse } from 'next/server';
import { getAPIs, createAPI, updateAPI, deleteAPI } from '../actions';
import { APIFormData } from '@/lib/types/api';

export async function GET() {
  try {
    const apis = await getAPIs();
    return NextResponse.json(apis);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch APIs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: APIFormData = await request.json();
    const api = await createAPI(body);
    return NextResponse.json(api, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create API' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'API ID is required' }, { status: 400 });
    }

    const body: APIFormData = await request.json();
    const api = await updateAPI(id, body);
    return NextResponse.json(api);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update API' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'API ID is required' }, { status: 400 });
    }

    await deleteAPI(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete API' },
      { status: 400 }
    );
  }
}
