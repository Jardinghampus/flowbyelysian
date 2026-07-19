-- Login audit log for team attendance (Hampus-only view).

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users (id) on delete set null,
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'agent')),
  ip_address text,
  user_agent text,
  logged_in_at timestamptz not null default now()
);

create index if not exists login_events_logged_in_at_idx
  on public.login_events (logged_in_at desc);

create index if not exists login_events_user_id_idx
  on public.login_events (user_id);

create index if not exists login_events_email_idx
  on public.login_events (lower(email));

alter table public.login_events enable row level security;

grant all on table public.login_events to service_role;

drop policy if exists "service role all login events" on public.login_events;
create policy "service role all login events"
  on public.login_events
  for all
  to service_role
  using (true)
  with check (true);
