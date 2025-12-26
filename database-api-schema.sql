-- API Table
-- Stores API endpoint configurations
create table public.api (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  name text not null,
  description text,
  method text not null default 'GET',
  url text not null,
  headers jsonb not null default '[]'::jsonb,
  cookies jsonb not null default '[]'::jsonb,
  url_params jsonb not null default '[]'::jsonb,
  payload_schema jsonb,
  constraint api_pkey primary key (id),
  constraint api_name_key unique (name),
  constraint api_method_check check (method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'))
) TABLESPACE pg_default;

-- Index for faster lookups
create index api_method_idx on public.api(method);
create index api_name_idx on public.api(name);

-- Function to update updated_at timestamp
create or replace function update_api_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_api_updated_at
  before update on public.api
  for each row
  execute function update_api_updated_at();

-- Example of the JSONB structure for headers, cookies, and url_params:
-- Headers: [{"name": "Content-Type", "value": "application/json"}, {"name": "Authorization", "value": "Bearer token"}]
-- Cookies: [{"name": "session", "value": "abc123"}, {"name": "theme", "value": "dark"}]
-- URL Params: [{"name": "page", "value": "1"}, {"name": "limit", "value": "10"}]
