-- Weekly office KPIs: total listings, new listings, offers, viewings.
-- Agents self-report per Mon–Sun week; board aggregates by week / 30d / 60d / 90d / YTD.

create table if not exists public.agent_weekly_kpis (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_name text not null default '',
  week_start date not null,
  total_listings integer not null default 0 check (total_listings >= 0),
  new_listings integer not null default 0 check (new_listings >= 0),
  offers integer not null default 0 check (offers >= 0),
  viewings integer not null default 0 check (viewings >= 0),
  notes text not null default '',
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, week_start)
);

create index if not exists agent_weekly_kpis_week_idx on public.agent_weekly_kpis(week_start desc);
create index if not exists agent_weekly_kpis_agent_week_idx on public.agent_weekly_kpis(agent_id, week_start desc);

alter table public.agent_weekly_kpis enable row level security;

grant all on table public.agent_weekly_kpis to service_role;

drop policy if exists "agent weekly kpis service" on public.agent_weekly_kpis;
create policy "agent weekly kpis service" on public.agent_weekly_kpis
  for all to service_role using (true) with check (true);

-- Also store KPI fields on daily_activity_log for day-level entry if needed later
alter table if exists public.daily_activity_log
  add column if not exists total_listings integer not null default 0,
  add column if not exists new_listings integer not null default 0,
  add column if not exists offers integer not null default 0;
