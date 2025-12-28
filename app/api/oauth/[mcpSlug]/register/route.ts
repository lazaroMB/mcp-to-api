import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils/url';

/**
 * OAuth 2.0 Dynamic Client Registration endpoint (RFC 7591)
 * This endpoint allows clients to dynamically register themselves
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const mcp = await getMCPBySlug(mcpSlug);
    
    if (!mcp) {
      return NextResponse.json(
        { error: 'invalid_resource', error_description: 'MCP not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const clientName = body.client_name;
    const redirectUris = body.redirect_uris;
    
    if (!clientName || !redirectUris || !Array.isArray(redirectUris) || redirectUris.length === 0) {
      return NextResponse.json(
        { error: 'invalid_client_metadata', error_description: 'Missing required fields: client_name, redirect_uris' },
        { status: 400 }
      );
    }
    
    // Validate redirect URIs (must be localhost or HTTPS)
    for (const uri of redirectUris) {
      try {
        const url = new URL(uri);
        if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          return NextResponse.json(
            { error: 'invalid_redirect_uri', error_description: 'Redirect URIs must use HTTPS or localhost' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'invalid_redirect_uri', error_description: 'Invalid redirect URI format' },
          { status: 400 }
        );
      }
    }
    
    // Generate client ID (using Client ID Metadata Document format - HTTPS URL)
    const baseUrl = getBaseUrl(request);
    const { randomUUID } = await import('crypto');
    const clientId = `${baseUrl}/api/oauth/${mcpSlug}/clients/${randomUUID()}`;
    
    // Store client registration (optional - for tracking)
    const supabase = await createClient();
    try {
      await supabase.from('oauth_clients').insert({
        client_id: clientId,
        client_name: clientName,
        client_uri: body.client_uri,
        logo_uri: body.logo_uri,
        redirect_uris: redirectUris,
        grant_types: body.grant_types || ['authorization_code'],
        response_types: body.response_types || ['code'],
        token_endpoint_auth_method: body.token_endpoint_auth_method || 'none',
        metadata_url: clientId, // For Client ID Metadata Documents
      });
    } catch (err) {
      // If storage fails, continue anyway (registration is still valid)
    }
    
    // Return client registration response
    return NextResponse.json({
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: clientName,
      client_uri: body.client_uri,
      logo_uri: body.logo_uri,
      redirect_uris: redirectUris,
      grant_types: body.grant_types || ['authorization_code'],
      response_types: body.response_types || ['code'],
      token_endpoint_auth_method: body.token_endpoint_auth_method || 'none',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', error_description: 'An error occurred during client registration' },
      { status: 500 }
    );
  }
}
