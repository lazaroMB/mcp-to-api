-- Migration: Add user authentication and RLS
-- This migration adds user_id columns and Row Level Security to all tables

-- Step 1: Add user_id columns to all tables
-- Note: We'll use auth.users.id from Supabase Auth

-- Add user_id to mcp table
alter table public.mcp
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Add user_id to api table
alter table public.api
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Add user_id to mcp_tools table (inherits from mcp, but we'll add it for consistency)
alter table public.mcp_tools
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Add user_id to mcp_resources table (inherits from mcp, but we'll add it for consistency)
alter table public.mcp_resources
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Add user_id to mcp_tool_api_mapping table
alter table public.mcp_tool_api_mapping
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Step 2: Create indexes for user_id columns for better query performance
create index if not exists mcp_user_id_idx on public.mcp(user_id);
create index if not exists api_user_id_idx on public.api(user_id);
create index if not exists mcp_tools_user_id_idx on public.mcp_tools(user_id);
create index if not exists mcp_resources_user_id_idx on public.mcp_resources(user_id);
create index if not exists mcp_tool_api_mapping_user_id_idx on public.mcp_tool_api_mapping(user_id);

-- Step 3: Enable Row Level Security on all tables
alter table public.mcp enable row level security;
alter table public.api enable row level security;
alter table public.mcp_tools enable row level security;
alter table public.mcp_resources enable row level security;
alter table public.mcp_tool_api_mapping enable row level security;

-- Step 4: Create RLS policies for mcp table
-- Policy: Users can only see their own MCPs
create policy "Users can view own MCPs"
  on public.mcp
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own MCPs
create policy "Users can insert own MCPs"
  on public.mcp
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own MCPs
create policy "Users can update own MCPs"
  on public.mcp
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own MCPs
create policy "Users can delete own MCPs"
  on public.mcp
  for delete
  using (auth.uid() = user_id);

-- Step 5: Create RLS policies for api table
-- Policy: Users can only see their own APIs
create policy "Users can view own APIs"
  on public.api
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own APIs
create policy "Users can insert own APIs"
  on public.api
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own APIs
create policy "Users can update own APIs"
  on public.api
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own APIs
create policy "Users can delete own APIs"
  on public.api
  for delete
  using (auth.uid() = user_id);

-- Step 6: Create RLS policies for mcp_tools table
-- Policy: Users can only see tools for their own MCPs
create policy "Users can view own MCP tools"
  on public.mcp_tools
  for select
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_tools.mcp_id)
  );

-- Policy: Users can insert tools for their own MCPs
create policy "Users can insert own MCP tools"
  on public.mcp_tools
  for insert
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp where id = mcp_tools.mcp_id)
  );

-- Policy: Users can update tools for their own MCPs
create policy "Users can update own MCP tools"
  on public.mcp_tools
  for update
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_tools.mcp_id)
  )
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp where id = mcp_tools.mcp_id)
  );

-- Policy: Users can delete tools for their own MCPs
create policy "Users can delete own MCP tools"
  on public.mcp_tools
  for delete
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_tools.mcp_id)
  );

-- Step 7: Create RLS policies for mcp_resources table
-- Policy: Users can only see resources for their own MCPs
create policy "Users can view own MCP resources"
  on public.mcp_resources
  for select
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_resources.mcp_id)
  );

-- Policy: Users can insert resources for their own MCPs
create policy "Users can insert own MCP resources"
  on public.mcp_resources
  for insert
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp where id = mcp_resources.mcp_id)
  );

-- Policy: Users can update resources for their own MCPs
create policy "Users can update own MCP resources"
  on public.mcp_resources
  for update
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_resources.mcp_id)
  )
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp where id = mcp_resources.mcp_id)
  );

-- Policy: Users can delete resources for their own MCPs
create policy "Users can delete own MCP resources"
  on public.mcp_resources
  for delete
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp where id = mcp_resources.mcp_id)
  );

-- Step 8: Create RLS policies for mcp_tool_api_mapping table
-- Policy: Users can only see mappings for their own tools and APIs
create policy "Users can view own mappings"
  on public.mcp_tool_api_mapping
  for select
  using (
    auth.uid() = user_id or
    auth.uid() = (select user_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id) or
    auth.uid() = (select user_id from public.api where id = mcp_tool_api_mapping.api_id)
  );

-- Policy: Users can insert mappings for their own tools and APIs
create policy "Users can insert own mappings"
  on public.mcp_tool_api_mapping
  for insert
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id) and
    auth.uid() = (select user_id from public.api where id = mcp_tool_api_mapping.api_id)
  );

-- Policy: Users can update mappings for their own tools and APIs
create policy "Users can update own mappings"
  on public.mcp_tool_api_mapping
  for update
  using (
    auth.uid() = user_id or
    (auth.uid() = (select user_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id) and
     auth.uid() = (select user_id from public.api where id = mcp_tool_api_mapping.api_id))
  )
  with check (
    auth.uid() = user_id and
    auth.uid() = (select user_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id) and
    auth.uid() = (select user_id from public.api where id = mcp_tool_api_mapping.api_id)
  );

-- Policy: Users can delete mappings for their own tools and APIs
create policy "Users can delete own mappings"
  on public.mcp_tool_api_mapping
  for delete
  using (
    auth.uid() = user_id or
    (auth.uid() = (select user_id from public.mcp_tools where id = mcp_tool_api_mapping.mcp_tool_id) and
     auth.uid() = (select user_id from public.api where id = mcp_tool_api_mapping.api_id))
  );

-- Step 9: Create a function to automatically set user_id on insert
-- This function will be used as a trigger to automatically set user_id
create or replace function public.set_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Step 10: Create triggers to automatically set user_id on insert
create trigger set_mcp_user_id
  before insert on public.mcp
  for each row
  execute function public.set_user_id();

create trigger set_api_user_id
  before insert on public.api
  for each row
  execute function public.set_user_id();

create trigger set_mcp_tools_user_id
  before insert on public.mcp_tools
  for each row
  execute function public.set_user_id();

create trigger set_mcp_resources_user_id
  before insert on public.mcp_resources
  for each row
  execute function public.set_user_id();

create trigger set_mcp_tool_api_mapping_user_id
  before insert on public.mcp_tool_api_mapping
  for each row
  execute function public.set_user_id();
