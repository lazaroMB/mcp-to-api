-- Migration: Allow public read access to enabled MCPs
-- This allows the public API routes to access enabled MCPs without authentication
-- while still protecting user data and write operations

-- Step 1: Add public read policy for enabled MCPs
-- Allow anyone to read enabled MCPs (for public API access)
-- Drop policy if it exists first
drop policy if exists "Public can view enabled MCPs" on public.mcp;
create policy "Public can view enabled MCPs"
  on public.mcp
  for select
  using (is_enabled = true);

-- Step 2: Add public read policy for tools of enabled MCPs
-- Allow anyone to read enabled tools for enabled MCPs
drop policy if exists "Public can view tools of enabled MCPs" on public.mcp_tools;
create policy "Public can view tools of enabled MCPs"
  on public.mcp_tools
  for select
  using (
    is_enabled = true and
    (select is_enabled from public.mcp where id = mcp_tools.mcp_id) = true
  );

-- Step 3: Add public read policy for resources of enabled MCPs (if table exists)
-- Allow anyone to read resources for enabled MCPs
-- Only create if mcp_resources table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'mcp_resources') then
    execute 'drop policy if exists "Public can view resources of enabled MCPs" on public.mcp_resources';
    execute 'create policy "Public can view resources of enabled MCPs"
      on public.mcp_resources
      for select
      using (
        (select is_enabled from public.mcp where id = mcp_resources.mcp_id) = true
      )';
  end if;
end $$;

-- Step 4: Add public read policy for mappings of enabled MCPs
-- Allow anyone to read mappings for enabled MCPs
drop policy if exists "Public can view mappings of enabled MCPs" on public.mcp_tool_api_mapping;
create policy "Public can view mappings of enabled MCPs"
  on public.mcp_tool_api_mapping
  for select
  using (
    (select is_enabled from public.mcp where id = (select mcp_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id)) = true
  );

-- Step 5: Add public read policy for APIs
-- Allow anyone to read enabled APIs
-- Note: The application layer will filter to only use APIs that are mapped to enabled tools
-- This avoids infinite recursion in RLS policies
drop policy if exists "Public can view APIs of enabled MCPs" on public.api;
create policy "Public can view APIs of enabled MCPs"
  on public.api
  for select
  using (is_enabled = true);

-- Note: The existing user-specific policies will still apply for authenticated users
-- This means:
-- - Authenticated users can see their own MCPs (enabled or disabled)
-- - Public can only see enabled MCPs
-- - Write operations remain restricted to owners
