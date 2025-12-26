-- MCP Tools Table
-- Stores tools (functions/capabilities) provided by each MCP server
create table public.mcp_tools (
  id uuid not null default gen_random_uuid(),
  mcp_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  name text not null,
  description text,
  input_schema jsonb not null default '{}'::jsonb,
  constraint mcp_tools_pkey primary key (id),
  constraint mcp_tools_mcp_id_fkey foreign key (mcp_id) references public.mcp(id) on delete cascade,
  constraint mcp_tools_mcp_id_name_key unique (mcp_id, name)
) TABLESPACE pg_default;

-- Index for faster lookups
create index mcp_tools_mcp_id_idx on public.mcp_tools(mcp_id);

-- MCP Resources Table
-- Stores resources (data/entities) accessible through each MCP server
create table public.mcp_resources (
  id uuid not null default gen_random_uuid(),
  mcp_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  uri text not null,
  name text not null,
  description text,
  mime_type text,
  constraint mcp_resources_pkey primary key (id),
  constraint mcp_resources_mcp_id_fkey foreign key (mcp_id) references public.mcp(id) on delete cascade,
  constraint mcp_resources_mcp_id_uri_key unique (mcp_id, uri)
) TABLESPACE pg_default;

-- Index for faster lookups
create index mcp_resources_mcp_id_idx on public.mcp_resources(mcp_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
create trigger update_mcp_tools_updated_at
  before update on public.mcp_tools
  for each row
  execute function update_updated_at_column();

create trigger update_mcp_resources_updated_at
  before update on public.mcp_resources
  for each row
  execute function update_updated_at_column();
