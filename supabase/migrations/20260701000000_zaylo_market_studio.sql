create extension if not exists pgcrypto;

create table if not exists public.zaylo_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  city text not null default 'Dubai',
  master_community text not null,
  community text not null,
  sub_community text not null,
  bayut_path text,
  property_types text[] not null default array['Villa', 'Townhouse'],
  bedrooms integer[] not null default array[3, 4, 5],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zaylo_source_links (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.zaylo_areas(id) on delete cascade,
  kind text not null check (
    kind in (
      'bayut_rent_listings',
      'bayut_sale_listings',
      'bayut_rent_transactions',
      'bayut_sale_transactions',
      'dxb_interact_transactions',
      'manual'
    )
  ),
  label text not null,
  url text not null,
  active boolean not null default true,
  last_status text not null default 'not_run' check (last_status in ('not_run', 'ready', 'blocked', 'error', 'empty')),
  last_scraped_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zaylo_market_metrics (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.zaylo_areas(id) on delete cascade,
  bedrooms integer not null check (bedrooms in (3, 4, 5)),
  property_type text not null check (property_type in ('Villa', 'Townhouse')),
  rental_avg_aed numeric,
  sale_avg_aed numeric,
  rent_sample_size integer not null default 0,
  sale_sample_size integer not null default 0,
  price_per_sqft_aed numeric,
  data_status text not null default 'needs_data' check (data_status in ('live', 'manual', 'draft', 'needs_data')),
  confidence_score numeric,
  source_summary jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, bedrooms, property_type)
);

create table if not exists public.zaylo_import_runs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'blocked', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  total_sources integer not null default 0,
  total_rows integer not null default 0,
  blocked_urls text[] not null default array[]::text[],
  error_count integer not null default 0,
  log text,
  created_at timestamptz not null default now()
);

create table if not exists public.zaylo_social_posts (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid references public.zaylo_market_metrics(id) on delete set null,
  area_id uuid references public.zaylo_areas(id) on delete set null,
  format text not null default '1350x1080',
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted', 'skipped')),
  hook text not null,
  headline text not null,
  body text not null,
  caption text not null,
  trust_line text,
  cta text,
  asset_url text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  posted_at timestamptz
);

alter table public.zaylo_areas enable row level security;
alter table public.zaylo_source_links enable row level security;
alter table public.zaylo_market_metrics enable row level security;
alter table public.zaylo_import_runs enable row level security;
alter table public.zaylo_social_posts enable row level security;

grant usage on schema public to service_role;
grant all on table public.zaylo_areas to service_role;
grant all on table public.zaylo_source_links to service_role;
grant all on table public.zaylo_market_metrics to service_role;
grant all on table public.zaylo_import_runs to service_role;
grant all on table public.zaylo_social_posts to service_role;

create policy "zaylo service role areas"
  on public.zaylo_areas
  for all
  to service_role
  using (true)
  with check (true);

create policy "zaylo service role source links"
  on public.zaylo_source_links
  for all
  to service_role
  using (true)
  with check (true);

create policy "zaylo service role market metrics"
  on public.zaylo_market_metrics
  for all
  to service_role
  using (true)
  with check (true);

create policy "zaylo service role import runs"
  on public.zaylo_import_runs
  for all
  to service_role
  using (true)
  with check (true);

create policy "zaylo service role social posts"
  on public.zaylo_social_posts
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists zaylo_areas_master_community_idx on public.zaylo_areas(master_community);
create index if not exists zaylo_source_links_area_id_idx on public.zaylo_source_links(area_id);
create index if not exists zaylo_market_metrics_area_id_idx on public.zaylo_market_metrics(area_id);
create index if not exists zaylo_social_posts_area_id_idx on public.zaylo_social_posts(area_id);
