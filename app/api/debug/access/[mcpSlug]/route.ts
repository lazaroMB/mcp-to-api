import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkMCPAccess } from '@/lib/auth/mcp-access';
import { getMCPBySlug } from '@/app/admin/mcps/mcp-actions';

/**
 * Debug endpoint to check MCP access
 * GET /api/debug/access/[mcpSlug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mcpSlug: string }> }
) {
  try {
    const { mcpSlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get MCP
    const mcp = await getMCPBySlug(mcpSlug);
    if (!mcp) {
      return NextResponse.json(
        { error: 'MCP not found' },
        { status: 404 }
      );
    }
    
    // Check access
    const accessCheck = await checkMCPAccess(mcpSlug, user.id);
    
    // Get access grants from database directly
    const { data: accessGrants, error: accessError } = await supabase
      .from('mcp_access')
      .select('*')
      .eq('mcp_id', mcp.id)
      .eq('user_id', user.id);
    
    // Get all access grants for this MCP (if user is owner)
    let allGrants = null;
    if (mcp.user_id === user.id) {
      const { data: allGrantsData } = await supabase
        .from('mcp_access')
        .select('*')
        .eq('mcp_id', mcp.id);
      allGrants = allGrantsData;
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      mcp: {
        id: mcp.id,
        slug: mcp.slug,
        name: mcp.name,
        visibility: mcp.visibility,
        ownerId: mcp.user_id,
        isEnabled: mcp.is_enabled,
      },
      accessCheck,
      userAccessGrants: accessGrants || [],
      allAccessGrants: allGrants || null,
      isOwner: mcp.user_id === user.id,
      accessError: accessError?.message || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
