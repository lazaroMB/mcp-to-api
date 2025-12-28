import { NextRequest, NextResponse } from 'next/server';
import { importOpenAPI } from '../actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'OpenAPI URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await importOpenAPI(url);
    
    if (!result.success && result.imported === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to import OpenAPI specification',
          details: result.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import OpenAPI specification' },
      { status: 500 }
    );
  }
}
