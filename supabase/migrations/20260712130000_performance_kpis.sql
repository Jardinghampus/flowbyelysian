-- Performance KPIs: company standards, personal targets, admin-entered monthly actuals.
-- Live commission/deals still roll up from `deals` (closed_won); manual actuals supplement.

create table if not exists public.company_kpi_standards (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer not null check (month between 1 and 12),
  target_deals integer not null default 0,
  target_sale_deals integer not null default 0,
  target_rent_deals integer not null default 0,
  target_commission_aed numeric not null default 0,
  target_sale_commission_aed numeric not null default 0,
  target_rent_commission_aed numeric not null default 0,
  target_revenue_aed numeric not null default 0,
  target_listings integer not null default 0,
  target_viewings integer not null default 0,
  notes text not null default '',
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year, month)
);

create table if not exists public.agent_kpi_targets (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  year integer not null,
  month integer not null check (month between 1 and 12),
  target_deals integer not null default 0,
  target_sale_deals integer not null default 0,
  target_rent_deals integer not null default 0,
  target_commission_aed numeric not null default 0,
  target_sale_commission_aed numeric not null default 0,
  target_rent_commission_aed numeric not null default 0,
  target_listings integer not null default 0,
  target_viewings integer not null default 0,
  custom_kpis jsonb not null default '{}'::jsonb,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, year, month)
);

-- Admin can enter/adjust monthly actuals (plus auto from deals in API layer)
create table if not exists public.agent_monthly_actuals (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_name text not null default '',
  year integer not null,
  month integer not null check (month between 1 and 12),
  sale_deals integer not null default 0,
  rent_deals integer not null default 0,
  sale_commission_aed numeric not null default 0,
  rent_commission_aed numeric not null default 0,
  sale_revenue_aed numeric not null default 0,
  rent_revenue_aed numeric not null default 0,
  listings integer not null default 0,
  viewings integer not null default 0,
  notes text not null default '',
  include_deals_rollup boolean not null default true,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, year, month)
);

create index if not exists agent_kpi_targets_agent_period_idx on public.agent_kpi_targets(agent_id, year, month);
create index if not exists agent_monthly_actuals_period_idx on public.agent_monthly_actuals(year, month);

alter table public.company_kpi_standards enable row level security;
alter table public.agent_kpi_targets enable row level security;
alter table public.agent_monthly_actuals enable row level security;

grant all on table public.company_kpi_standards to service_role;
grant all on table public.agent_kpi_targets to service_role;
grant all on table public.agent_monthly_actuals to service_role;

drop policy if exists "company kpi service" on public.company_kpi_standards;
create policy "company kpi service" on public.company_kpi_standards for all to service_role using (true) with check (true);

drop policy if exists "agent targets service" on public.agent_kpi_targets;
create policy "agent targets service" on public.agent_kpi_targets for all to service_role using (true) with check (true);

drop policy if exists "agent actuals service" on public.agent_monthly_actuals;
create policy "agent actuals service" on public.agent_monthly_actuals for all to service_role using (true) with check (true);

-- Seed current month company standards (editable by admin)
insert into public.company_kpi_standards (
  year, month,
  target_deals, target_sale_deals, target_rent_deals,
  target_commission_aed, target_sale_commission_aed, target_rent_commission_aed,
  target_revenue_aed, target_listings, target_viewings, notes
)
values (
  extract(year from now())::int,
  extract(month from now())::int,
  20, 8, 12,
  400000, 280000, 120000,
  8000000, 40, 80,
  'Default company standards — adjust in Admin → Performance'
)
on conflict (year, month) do nothing;
