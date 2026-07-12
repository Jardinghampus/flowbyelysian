create extension if not exists pgcrypto;

-- Foundation tables for the audit roadmap:
-- - team/user access model
-- - universal CRM activity timeline
-- - operational audit/job/webhook tracking
-- - AI run, cost, recommendation, and action governance
--
-- These tables are intentionally service-role-only for now because the app uses
-- Clerk for user auth and server API routes use the Supabase service role. Do
-- not expose these directly to anon/authenticated clients until Clerk/Supabase
-- JWT mapping is designed and tested.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  primary_team_id uuid references public.teams(id) on delete set null,
  email text,
  full_name text,
  role text not null default 'agent' check (role in ('admin', 'manager', 'operator', 'agent')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null default 'agent' check (role in ('admin', 'manager', 'operator', 'agent')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, user_profile_id)
);

insert into public.teams (name, slug)
values ('Flow by Elysian', 'flow-by-elysian')
on conflict (slug) do nothing;

create table if not exists public.crm_activity_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  actor_user_id text,
  actor_name text,
  entity_type text not null,
  entity_id text not null,
  event_type text not null,
  title text not null,
  body text,
  source text not null default 'api',
  visibility text not null default 'team' check (visibility in ('private', 'team', 'admin')),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  actor_user_id text,
  actor_role text,
  action text not null,
  target_type text not null,
  target_id text,
  request_id text,
  ip_address text,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.job_runs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'blocked', 'failed', 'cancelled')),
  source text not null default 'api',
  requested_by text,
  idempotency_key text,
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_type, idempotency_key)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text,
  event_type text not null,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create table if not exists public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  feature text not null,
  version integer not null default 1,
  model text not null,
  system_prompt text not null,
  response_schema jsonb not null default '{}'::jsonb,
  temperature numeric not null default 0.2,
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  unique (feature, version)
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  user_id text,
  feature text not null,
  prompt_version_id uuid references public.ai_prompt_versions(id) on delete set null,
  model text not null,
  entity_type text,
  entity_id text,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  input_summary text,
  output_summary text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  ai_run_id uuid references public.ai_runs(id) on delete cascade,
  feature text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  source_run_id uuid references public.ai_runs(id) on delete set null,
  target_entity_type text not null,
  target_entity_id text not null,
  recommendation_type text not null,
  title text not null,
  body text not null,
  confidence numeric,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'applied', 'expired')),
  approved_by text,
  applied_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_actions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  source_run_id uuid references public.ai_runs(id) on delete set null,
  action_type text not null,
  target_entity_type text not null,
  target_entity_id text,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'executed', 'failed', 'cancelled')),
  requires_approval boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  approved_by text,
  executed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_entity_summaries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  source_event_until timestamptz,
  model text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, entity_type, entity_id)
);

create table if not exists public.ai_embeddings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  content_hash text not null,
  content_excerpt text,
  embedding_model text not null,
  embedding jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (team_id, entity_type, entity_id, content_hash)
);

-- Retrofit team/source columns onto existing sensitive tables.
alter table if exists public.owners add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.owners add column if not exists source text not null default 'manual';
alter table if exists public.owners add column if not exists import_run_id uuid;

alter table if exists public.outreach_logs add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.daily_activity_log add column if not exists team_id uuid references public.teams(id) on delete set null;

alter table if exists public.listing_viewings add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.listing_leads add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.landlord_reports add column if not exists team_id uuid references public.teams(id) on delete set null;

alter table if exists public.documents add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.templates add column if not exists team_id uuid references public.teams(id) on delete set null;
alter table if exists public.document_settings add column if not exists team_id uuid references public.teams(id) on delete set null;

alter table public.teams enable row level security;
alter table public.user_profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.crm_activity_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.job_runs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.ai_prompt_versions enable row level security;
alter table public.ai_runs enable row level security;
alter table public.ai_cost_ledger enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.ai_actions enable row level security;
alter table public.ai_entity_summaries enable row level security;
alter table public.ai_embeddings enable row level security;
alter table if exists public.owners enable row level security;
alter table if exists public.outreach_logs enable row level security;
alter table if exists public.daily_activity_log enable row level security;
alter table if exists public.listing_viewings enable row level security;
alter table if exists public.listing_leads enable row level security;
alter table if exists public.landlord_reports enable row level security;

grant usage on schema public to service_role;
grant all on table public.teams to service_role;
grant all on table public.user_profiles to service_role;
grant all on table public.team_members to service_role;
grant all on table public.crm_activity_events to service_role;
grant all on table public.audit_logs to service_role;
grant all on table public.job_runs to service_role;
grant all on table public.webhook_events to service_role;
grant all on table public.ai_prompt_versions to service_role;
grant all on table public.ai_runs to service_role;
grant all on table public.ai_cost_ledger to service_role;
grant all on table public.ai_recommendations to service_role;
grant all on table public.ai_actions to service_role;
grant all on table public.ai_entity_summaries to service_role;
grant all on table public.ai_embeddings to service_role;

drop policy if exists "service role all teams" on public.teams;
drop policy if exists "service role all user profiles" on public.user_profiles;
drop policy if exists "service role all team members" on public.team_members;
drop policy if exists "service role all crm activity events" on public.crm_activity_events;
drop policy if exists "service role all audit logs" on public.audit_logs;
drop policy if exists "service role all job runs" on public.job_runs;
drop policy if exists "service role all webhook events" on public.webhook_events;
drop policy if exists "service role all ai prompt versions" on public.ai_prompt_versions;
drop policy if exists "service role all ai runs" on public.ai_runs;
drop policy if exists "service role all ai cost ledger" on public.ai_cost_ledger;
drop policy if exists "service role all ai recommendations" on public.ai_recommendations;
drop policy if exists "service role all ai actions" on public.ai_actions;
drop policy if exists "service role all ai entity summaries" on public.ai_entity_summaries;
drop policy if exists "service role all ai embeddings" on public.ai_embeddings;

create policy "service role all teams" on public.teams for all to service_role using (true) with check (true);
create policy "service role all user profiles" on public.user_profiles for all to service_role using (true) with check (true);
create policy "service role all team members" on public.team_members for all to service_role using (true) with check (true);
create policy "service role all crm activity events" on public.crm_activity_events for all to service_role using (true) with check (true);
create policy "service role all audit logs" on public.audit_logs for all to service_role using (true) with check (true);
create policy "service role all job runs" on public.job_runs for all to service_role using (true) with check (true);
create policy "service role all webhook events" on public.webhook_events for all to service_role using (true) with check (true);
create policy "service role all ai prompt versions" on public.ai_prompt_versions for all to service_role using (true) with check (true);
create policy "service role all ai runs" on public.ai_runs for all to service_role using (true) with check (true);
create policy "service role all ai cost ledger" on public.ai_cost_ledger for all to service_role using (true) with check (true);
create policy "service role all ai recommendations" on public.ai_recommendations for all to service_role using (true) with check (true);
create policy "service role all ai actions" on public.ai_actions for all to service_role using (true) with check (true);
create policy "service role all ai entity summaries" on public.ai_entity_summaries for all to service_role using (true) with check (true);
create policy "service role all ai embeddings" on public.ai_embeddings for all to service_role using (true) with check (true);

-- Tighten broad/demo RLS policies only when the legacy tables exist in the
-- target project. The production Supabase schema may lag behind local history.
do $$
begin
  if to_regclass('public.owners') is not null then
    execute 'drop policy if exists "Owners are viewable by authenticated users" on public.owners';
    execute 'drop policy if exists "Users can insert owners" on public.owners';
    execute 'drop policy if exists "Users can update owners" on public.owners';
    execute 'drop policy if exists "Users can delete owners" on public.owners';
    execute 'grant all on table public.owners to service_role';
    execute 'drop policy if exists "service role all owners" on public.owners';
    execute 'create policy "service role all owners" on public.owners for all to service_role using (true) with check (true)';
    execute 'create index if not exists owners_team_id_idx on public.owners(team_id)';
  end if;

  if to_regclass('public.outreach_logs') is not null then
    execute 'drop policy if exists "Outreach logs are viewable by authenticated users" on public.outreach_logs';
    execute 'drop policy if exists "Users can insert outreach logs" on public.outreach_logs';
    execute 'drop policy if exists "Users can update outreach logs" on public.outreach_logs';
    execute 'grant all on table public.outreach_logs to service_role';
    execute 'drop policy if exists "service role all outreach logs" on public.outreach_logs';
    execute 'create policy "service role all outreach logs" on public.outreach_logs for all to service_role using (true) with check (true)';
    execute 'create index if not exists outreach_logs_team_id_idx on public.outreach_logs(team_id)';
  end if;

  if to_regclass('public.daily_activity_log') is not null then
    execute 'drop policy if exists "Daily activity is viewable by authenticated users" on public.daily_activity_log';
    execute 'drop policy if exists "Users can insert their own daily activity" on public.daily_activity_log';
    execute 'drop policy if exists "Users can update their own daily activity" on public.daily_activity_log';
    execute 'grant all on table public.daily_activity_log to service_role';
    execute 'drop policy if exists "service role all daily activity" on public.daily_activity_log';
    execute 'create policy "service role all daily activity" on public.daily_activity_log for all to service_role using (true) with check (true)';
    execute 'create index if not exists daily_activity_log_team_id_idx on public.daily_activity_log(team_id)';
  end if;

  if to_regclass('public.listing_viewings') is not null then
    execute 'drop policy if exists "Allow all for listing_viewings" on public.listing_viewings';
    execute 'grant all on table public.listing_viewings to service_role';
    execute 'drop policy if exists "service role all listing viewings" on public.listing_viewings';
    execute 'create policy "service role all listing viewings" on public.listing_viewings for all to service_role using (true) with check (true)';
  end if;

  if to_regclass('public.listing_leads') is not null then
    execute 'drop policy if exists "Allow all for listing_leads" on public.listing_leads';
    execute 'grant all on table public.listing_leads to service_role';
    execute 'drop policy if exists "service role all listing leads" on public.listing_leads';
    execute 'create policy "service role all listing leads" on public.listing_leads for all to service_role using (true) with check (true)';
  end if;

  if to_regclass('public.landlord_reports') is not null then
    execute 'drop policy if exists "Allow all for landlord_reports" on public.landlord_reports';
    execute 'grant all on table public.landlord_reports to service_role';
    execute 'drop policy if exists "service role all landlord reports" on public.landlord_reports';
    execute 'create policy "service role all landlord reports" on public.landlord_reports for all to service_role using (true) with check (true)';
  end if;
end $$;

create index if not exists teams_slug_idx on public.teams(slug);
create index if not exists user_profiles_clerk_user_id_idx on public.user_profiles(clerk_user_id);
create index if not exists team_members_team_id_idx on public.team_members(team_id);
create index if not exists crm_activity_events_entity_idx on public.crm_activity_events(entity_type, entity_id, occurred_at desc);
create index if not exists crm_activity_events_team_idx on public.crm_activity_events(team_id, occurred_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs(target_type, target_id, created_at desc);
create index if not exists job_runs_status_idx on public.job_runs(status, created_at desc);
create index if not exists webhook_events_provider_idx on public.webhook_events(provider, provider_event_id);
create index if not exists ai_runs_entity_idx on public.ai_runs(entity_type, entity_id, created_at desc);
create index if not exists ai_runs_feature_idx on public.ai_runs(feature, created_at desc);
create index if not exists ai_cost_ledger_team_idx on public.ai_cost_ledger(team_id, created_at desc);
create index if not exists ai_recommendations_target_idx on public.ai_recommendations(target_entity_type, target_entity_id, status);
create index if not exists ai_actions_status_idx on public.ai_actions(status, risk_level, created_at desc);
-- Make owner aggregate views respect underlying RLS on Postgres 15+.
do $$
begin
  if to_regclass('public.owners') is not null and to_regclass('public.outreach_logs') is not null then
    execute $view$
      create or replace view public.owners_with_counts
      with (security_invoker = true)
      as
      select
        o.*,
        coalesce(counts.call_count, 0) as call_count,
        coalesce(counts.whatsapp_count, 0) as whatsapp_count,
        coalesce(counts.total_outreach, 0) as total_outreach
      from public.owners o
      left join lateral (
        select
          count(*) filter (where type = 'call') as call_count,
          count(*) filter (where type = 'whatsapp') as whatsapp_count,
          count(*) as total_outreach
        from public.outreach_logs
        where owner_id = o.id
      ) counts on true
    $view$;

    execute $view$
      create or replace view public.owners_active
      with (security_invoker = true)
      as
      select *
      from public.owners_with_counts
      where is_hidden = false
    $view$;
  end if;
end $$;
