-- Add uri field to mcp_tools table
-- This allows tools to be used as resources as well

alter table public.mcp_tools
  add column uri text;

-- Generate URIs for existing tools based on their name
-- Format: tool://<tool_name>
update public.mcp_tools
  set uri = 'tool://' || name
  where uri is null;

-- Make uri required and unique per MCP
alter table public.mcp_tools
  alter column uri set not null;

-- Add unique constraint for uri per MCP
alter table public.mcp_tools
  add constraint mcp_tools_mcp_id_uri_key unique (mcp_id, uri);

-- Add comment
comment on column public.mcp_tools.uri is 'URI for accessing this tool as a resource. Format: tool://<name> or custom URI';
