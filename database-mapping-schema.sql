-- MCP Tool to API Mapping Table
-- Stores the relationship and mapping configuration between MCP tools and APIs
create table public.mcp_tool_api_mapping (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  mcp_tool_id uuid not null,
  api_id uuid not null,
  mapping_config jsonb not null default '{}'::jsonb,
  constraint mcp_tool_api_mapping_pkey primary key (id),
  constraint mcp_tool_api_mapping_mcp_tool_id_fkey foreign key (mcp_tool_id) references public.mcp_tools(id) on delete cascade,
  constraint mcp_tool_api_mapping_api_id_fkey foreign key (api_id) references public.api(id) on delete cascade,
  constraint mcp_tool_api_mapping_unique unique (mcp_tool_id, api_id)
) TABLESPACE pg_default;

-- Indexes for faster lookups
create index mcp_tool_api_mapping_tool_id_idx on public.mcp_tool_api_mapping(mcp_tool_id);
create index mcp_tool_api_mapping_api_id_idx on public.mcp_tool_api_mapping(api_id);

-- Function to update updated_at timestamp
create or replace function update_mapping_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_mcp_tool_api_mapping_updated_at
  before update on public.mcp_tool_api_mapping
  for each row
  execute function update_mapping_updated_at();

-- Example mapping_config structure:
-- {
--   "field_mappings": [
--     {
--       "tool_field": "file_path",
--       "api_field": "path",
--       "transformation": "direct" | "constant" | "expression",
--       "value": "static_value_if_constant",
--       "expression": "javascript_expression_if_expression"
--     }
--   ],
--   "static_fields": {
--     "api_field_name": "static_value"
--   },
--   "transformations": {
--     "api_field_name": {
--       "type": "json_path" | "template" | "function",
--       "config": {}
--     }
--   }
-- }
