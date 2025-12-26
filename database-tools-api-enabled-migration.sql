-- Migration: Add is_enabled field to mcp_tools and api tables
-- This allows tools and APIs to be enabled/disabled independently

-- Add is_enabled column to mcp_tools table
alter table public.mcp_tools
  add column if not exists is_enabled boolean not null default true;

-- Add is_enabled column to api table
alter table public.api
  add column if not exists is_enabled boolean not null default true;

-- Create indexes for faster lookups of enabled tools and APIs
create index if not exists mcp_tools_is_enabled_idx on public.mcp_tools(is_enabled);
create index if not exists api_is_enabled_idx on public.api(is_enabled);

-- Add comments to explain the fields
comment on column public.mcp_tools.is_enabled is 'If false, the tool will not be available when queried';
comment on column public.api.is_enabled is 'If false, the API will not be available when queried';
