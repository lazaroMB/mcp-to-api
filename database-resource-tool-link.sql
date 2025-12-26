-- Add tool_id to mcp_resources table to link resources to tools
-- This allows resources to use a tool's input schema as parameters

alter table public.mcp_resources
  add column tool_id uuid references public.mcp_tools(id) on delete set null;

-- Index for faster lookups
create index mcp_resources_tool_id_idx on public.mcp_resources(tool_id);

-- Add comment
comment on column public.mcp_resources.tool_id is 'Optional link to a tool whose input schema provides parameters for this resource';
