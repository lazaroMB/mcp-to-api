import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationServerMetadata } from '@/lib/oauth/metadata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const metadata = await getAuthorizationServerMetadata(mcpSlug);
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'MCP not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
