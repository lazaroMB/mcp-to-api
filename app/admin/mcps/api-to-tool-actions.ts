'use server';

import { getAPI } from '@/app/admin/api/actions';
import { createMCPTool, getMCPTools } from './tools-actions';
import { createMapping } from './tool-mapping-actions';
import { createToolFromAPI, createMappingConfigFromAPITool } from '@/lib/utils/api-to-tool';
import { MCPTool } from '@/lib/types/mcp';
import { MCPToolAPIMapping } from '@/lib/types/mapping';
import { redirect } from 'next/navigation';

/**
 * Generates a unique tool name by checking existing tools and appending a number if needed
 */
function generateUniqueToolName(baseName: string, existingTools: MCPTool[]): string {
  const existingNames = new Set(existingTools.map(t => t.name));
  
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  // Try appending numbers: tool_name_2, tool_name_3, etc.
  let counter = 2;
  let uniqueName = `${baseName}_${counter}`;
  
  while (existingNames.has(uniqueName)) {
    counter++;
    uniqueName = `${baseName}_${counter}`;
  }
  
  return uniqueName;
}

/**
 * Generates a unique URI by checking existing tools and appending a number if needed
 */
function generateUniqueURI(baseURI: string, existingTools: MCPTool[]): string {
  const existingURIs = new Set(existingTools.map(t => t.uri));
  
  if (!existingURIs.has(baseURI)) {
    return baseURI;
  }

  // Extract base name from URI (e.g., "tool://name" -> "name")
  const uriMatch = baseURI.match(/^(.+:\/\/)(.+)$/);
  if (!uriMatch) {
    // If URI doesn't match pattern, just append number
    let counter = 2;
    let uniqueURI = `${baseURI}_${counter}`;
    while (existingURIs.has(uniqueURI)) {
      counter++;
      uniqueURI = `${baseURI}_${counter}`;
    }
    return uniqueURI;
  }

  const [, scheme, name] = uriMatch;
  let counter = 2;
  let uniqueURI = `${scheme}${name}_${counter}`;
  
  while (existingURIs.has(uniqueURI)) {
    counter++;
    uniqueURI = `${scheme}${name}_${counter}`;
  }
  
  return uniqueURI;
}

/**
 * Creates a tool and mapping from an API sequentially without revalidatePath
 * This version doesn't trigger revalidation to avoid render issues
 * Uses direct database calls to ensure sequential execution
 */
async function createToolAndMappingFromAPISequential(
  mcpId: string,
  apiId: string,
  existingToolsData: Array<{ id: string }>
): Promise<{ tool: MCPTool; mapping: MCPToolAPIMapping }> {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth } = await import('@/lib/auth/middleware');
  await requireAuth();
  const supabase = await createClient();
  
  // Fetch the API
  const api = await getAPI(apiId);
  if (!api) {
    throw new Error('API not found');
  }

  // Get full tool data for name checking
  let existingTools: MCPTool[] = [];
  if (existingToolsData.length > 0) {
    const { data: fullTools } = await supabase
      .from('mcp_tools')
      .select('id, name, uri')
      .in('id', existingToolsData.map(t => t.id));
    
    if (fullTools) {
      existingTools = fullTools as MCPTool[];
    }
  }

  // Create tool from API
  const toolFormData = createToolFromAPI(api);
  
  // Generate unique name and URI
  const uniqueName = generateUniqueToolName(toolFormData.name, existingTools);
  const uniqueURI = generateUniqueURI(toolFormData.uri, existingTools);
  
  // Create tool directly without revalidatePath
  const uri = uniqueURI || `tool://${uniqueName}`;
  const { data: tool, error: toolError } = await supabase
    .from('mcp_tools')
    .insert({
      mcp_id: mcpId,
      name: uniqueName,
      description: toolFormData.description || null,
      input_schema: toolFormData.input_schema || {},
      uri: uri,
      is_enabled: toolFormData.is_enabled ?? true,
    })
    .select()
    .single();

  if (toolError) {
    // Check if it's a duplicate key error
    if (toolError.code === '23505') {
      // Duplicate key - tool was created by another request
      // Try to find it
      const { data: existingTool } = await supabase
        .from('mcp_tools')
        .select('*')
        .eq('mcp_id', mcpId)
        .eq('name', uniqueName)
        .single();
      
      if (existingTool) {
        // Check if mapping exists
        const { data: existingMapping } = await supabase
          .from('mcp_tool_api_mapping')
          .select('*')
          .eq('mcp_tool_id', existingTool.id)
          .eq('api_id', apiId)
          .maybeSingle();
        
        if (existingMapping) {
          return { tool: existingTool as MCPTool, mapping: existingMapping as MCPToolAPIMapping };
        }
      }
    }
    throw new Error(`Failed to create MCP tool: ${toolError.message}`);
  }

  // Wait a moment to ensure tool is committed
  await new Promise(resolve => setTimeout(resolve, 50));

  // Create mapping config
  const mappingConfig = createMappingConfigFromAPITool(tool.input_schema, api);

  // Check if mapping already exists (race condition protection)
  const { data: existingMapping } = await supabase
    .from('mcp_tool_api_mapping')
    .select('*')
    .eq('mcp_tool_id', tool.id)
    .eq('api_id', apiId)
    .maybeSingle();

  if (existingMapping) {
    // Mapping already exists (created by another request)
    return { tool: tool as MCPTool, mapping: existingMapping as MCPToolAPIMapping };
  }

  // Create mapping directly without revalidatePath
  const { data: mapping, error: mappingError } = await supabase
    .from('mcp_tool_api_mapping')
    .insert({
      mcp_tool_id: tool.id,
      api_id: apiId,
      mapping_config: mappingConfig || { field_mappings: [] },
    })
    .select()
    .single();

  if (mappingError) {
    // If mapping creation fails and it's not a duplicate, try to delete the tool
    if (mappingError.code !== '23505') {
      await supabase.from('mcp_tools').delete().eq('id', tool.id);
    }
    throw new Error(`Failed to create mapping: ${mappingError.message}`);
  }

  return { tool: tool as MCPTool, mapping: mapping as MCPToolAPIMapping };
}

/**
 * Creates a tool and mapping from an API
 * Returns the created tool and mapping
 * This function assumes duplicate checks have been done at a higher level
 * but includes a final safety check before creation
 * NOTE: This version uses revalidatePath, use createToolAndMappingFromAPISequential for server actions
 */
export async function createToolAndMappingFromAPI(
  mcpId: string,
  apiId: string
): Promise<{ tool: MCPTool; mapping: MCPToolAPIMapping }> {
  // Fetch the API
  const api = await getAPI(apiId);
  if (!api) {
    throw new Error('API not found');
  }

  // Get existing tools to check for duplicates and generate unique names
  const existingTools = await getMCPTools(mcpId);
  
  // Final safety check: Verify no tool already maps to this API
  // This is a last line of defense against race conditions
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  
  const toolIds = existingTools.map(t => t.id);
  
  if (toolIds.length > 0) {
    const { data: existingMapping } = await supabase
      .from('mcp_tool_api_mapping')
      .select('mcp_tool_id')
      .in('mcp_tool_id', toolIds)
      .eq('api_id', apiId)
      .maybeSingle();
    
    if (existingMapping) {
      // Tool was created between checks, get it and return
      const existingTool = existingTools.find(t => t.id === existingMapping.mcp_tool_id);
      if (existingTool) {
        const { getToolMapping } = await import('./tool-mapping-actions');
        const mapping = await getToolMapping(existingTool.id);
        if (mapping) {
          return { tool: existingTool, mapping };
        }
      }
    }
  }

  // Create tool from API
  const toolFormData = createToolFromAPI(api);
  
  // Generate unique name and URI based on current tools
  const uniqueName = generateUniqueToolName(toolFormData.name, existingTools);
  const uniqueURI = generateUniqueURI(toolFormData.uri, existingTools);
  
  // Update tool form data with unique name and URI
  const uniqueToolFormData = {
    ...toolFormData,
    name: uniqueName,
    uri: uniqueURI,
  };

  // Create the tool
  const tool = await createMCPTool(mcpId, uniqueToolFormData);

  // Create mapping config
  const mappingConfig = createMappingConfigFromAPITool(tool.input_schema, api);

  // Create mapping
  const mapping = await createMapping(tool.id, {
    api_id: apiId,
    mapping_config: mappingConfig,
  });

  return { tool, mapping };
}

/**
 * Server action to add an API to an MCP
 * This handles the creation and redirect to avoid revalidatePath during render
 * Uses sequential creation with proper waiting to prevent race conditions
 * Returns the tool ID instead of redirecting to allow client-side navigation
 */
export async function addAPIToMCP(
  mcpId: string,
  apiId: string,
  timeRange: string = 'all'
): Promise<{ success: boolean; toolId?: string; error?: string }> {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth } = await import('@/lib/auth/middleware');
  await requireAuth();
  const supabase = await createClient();
  
  // Atomic check: Get all tools for this MCP and check for existing mapping in one query
  const { data: toolsData, error: toolsError } = await supabase
    .from('mcp_tools')
    .select('id')
    .eq('mcp_id', mcpId);
  
  if (toolsError) {
    throw new Error(`Failed to check existing tools: ${toolsError.message}`);
  }
  
  const toolIds = (toolsData || []).map(t => t.id);
  
  // Check if any tool already maps to this API (atomic check)
  if (toolIds.length > 0) {
    const { data: existingMapping, error: mappingError } = await supabase
      .from('mcp_tool_api_mapping')
      .select('mcp_tool_id')
      .in('mcp_tool_id', toolIds)
      .eq('api_id', apiId)
      .limit(1)
      .maybeSingle();
    
    if (mappingError && mappingError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing mappings: ${mappingError.message}`);
    }
    
    if (existingMapping) {
      // Tool already exists, return existing tool ID
      return { 
        success: true, 
        toolId: existingMapping.mcp_tool_id 
      };
    }
  }
  
  try {
    // Create tool and mapping sequentially without revalidatePath
    const { tool, mapping } = await createToolAndMappingFromAPISequential(mcpId, apiId, toolsData || []);
    
    // Verify creation completed successfully by polling if needed
    let verifiedTool = tool;
    let attempts = 0;
    while (attempts < 5) {
      const { data: verifyTool } = await supabase
        .from('mcp_tools')
        .select('*')
        .eq('id', tool.id)
        .single();
      
      if (verifyTool) {
        verifiedTool = verifyTool as MCPTool;
        // Check mapping exists
        const { data: verifyMapping } = await supabase
          .from('mcp_tool_api_mapping')
          .select('*')
          .eq('mcp_tool_id', tool.id)
          .eq('api_id', apiId)
          .maybeSingle();
        
        if (verifyMapping) {
          break; // Both tool and mapping exist, we're good
        }
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Return success with tool ID for client-side navigation
    return { 
      success: true, 
      toolId: verifiedTool.id 
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tool from API'
    };
  }
}
