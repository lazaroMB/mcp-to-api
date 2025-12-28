import { NextRequest, NextResponse } from 'next/server';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';

/**
 * JSON Web Key Set (JWKS) endpoint
 * This endpoint provides the public keys for verifying JWT tokens
 * 
 * Note: For simplicity, we're using HS256 (symmetric) which doesn't require JWKS.
 * In production, you should use RS256 (asymmetric) and provide proper JWKS.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const mcp = await getMCPBySlug(mcpSlug);
    
    if (!mcp) {
      return NextResponse.json(
        { error: 'MCP not found' },
        { status: 404 }
      );
    }
    
    // For HS256 (symmetric signing), we don't expose the secret
    // Return an empty keys array or a note that keys are not available
    // In production with RS256, you would return the public key here
    
    const jwks = {
      keys: [
        // Note: HS256 tokens don't require JWKS as they use a shared secret
        // If you switch to RS256, add your public key here in JWK format
        // {
        //   kty: "RSA",
        //   use: "sig",
        //   kid: "key-id",
        //   n: "...",
        //   e: "AQAB"
        // }
      ],
    };
    
    return NextResponse.json(jwks, {
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
