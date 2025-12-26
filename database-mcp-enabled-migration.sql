-- Migration: Add is_enabled field to MCP table
-- This allows MCPs to be enabled/disabled

-- Add is_enabled column to mcp table
alter table public.mcp
  add column if not exists is_enabled boolean not null default true;

-- Create index for faster lookups of enabled MCPs
create index if not exists mcp_is_enabled_idx on public.mcp(is_enabled);

-- Add comment to explain the field
comment on column public.mcp.is_enabled is 'If false, the MCP will appear as non-existent when queried by slug';
