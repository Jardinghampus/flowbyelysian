-- Lightweight email/password auth for small teams (<10).
-- App authenticates via service-role API routes; table is service-role only.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role text not null default 'agent' check (role in ('admin', 'agent')),
  can_access_social boolean not null default false,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_users_email_idx on public.app_users (lower(email));
create index if not exists app_users_role_idx on public.app_users (role);

alter table public.app_users enable row level security;

grant all on table public.app_users to service_role;

drop policy if exists "service role all app users" on public.app_users;
create policy "service role all app users"
  on public.app_users
  for all
  to service_role
  using (true)
  with check (true);
