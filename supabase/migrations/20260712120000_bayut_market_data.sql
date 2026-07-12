-- Bayut market intelligence (scraped portal data) — separate from agency CRM inventory (`listings`).
-- Replaces Google Sheets as the scraper sink.

create extension if not exists pgcrypto;

-- Ensure Zaylo control tables exist (may already be present from 20260701000000).
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
  area_id uuid references public.zaylo_areas(id) on delete cascade,
  community text,
  bedrooms integer not null check (bedrooms >= 0 and bedrooms <= 6),
  property_type text not null default 'Villa',
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
  updated_at timestamptz not null default now()
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
  narrative text default 'dubai_land_villa_expert',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  posted_at timestamptz
);

-- Scraped Bayut active listings (Sheets replacement)
create table if not exists public.bayut_market_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'bayut',
  community text not null,
  master_community text,
  listing_number text not null default '',
  permit_number text not null default '',
  title text not null default '',
  price numeric,
  currency text not null default 'AED',
  rent_period text not null default '',
  location text not null default '',
  beds integer check (beds is null or (beds >= 0 and beds <= 6)),
  baths numeric,
  size_sqft numeric,
  property_type text not null default '',
  agency text not null default '',
  agent_name text not null default '',
  listing_url text not null,
  page_url text not null default '',
  transaction_type text not null default 'rent' check (transaction_type in ('rent', 'sale')),
  status text not null default 'active' check (status in ('active', 'not_seen', 'blocked')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  import_run_id uuid references public.zaylo_import_runs(id) on delete set null,
  import_id text not null default '',
  notes text not null default '',
  raw_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_url)
);

create table if not exists public.bayut_transactions (
  id uuid primary key default gen_random_uuid(),
  community text not null,
  master_community text,
  bedrooms integer check (bedrooms is null or (bedrooms >= 0 and bedrooms <= 6)),
  property_type text not null default '',
  transaction_type text not null check (transaction_type in ('rent', 'sale')),
  price_aed numeric,
  size_sqft numeric,
  price_per_sqft_aed numeric,
  transaction_date date,
  source_url text not null,
  import_run_id uuid references public.zaylo_import_runs(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bayut_market_listings_community_idx on public.bayut_market_listings(community);
create index if not exists bayut_market_listings_status_idx on public.bayut_market_listings(status);
create index if not exists bayut_market_listings_beds_idx on public.bayut_market_listings(beds);
create index if not exists bayut_market_listings_tx_idx on public.bayut_market_listings(transaction_type);
create index if not exists bayut_market_listings_last_seen_idx on public.bayut_market_listings(last_seen desc);
create index if not exists bayut_transactions_community_idx on public.bayut_transactions(community);
create index if not exists bayut_transactions_date_idx on public.bayut_transactions(transaction_date desc);

alter table public.zaylo_areas enable row level security;
alter table public.zaylo_source_links enable row level security;
alter table public.zaylo_market_metrics enable row level security;
alter table public.zaylo_import_runs enable row level security;
alter table public.zaylo_social_posts enable row level security;
alter table public.bayut_market_listings enable row level security;
alter table public.bayut_transactions enable row level security;

grant all on table public.zaylo_areas to service_role;
grant all on table public.zaylo_source_links to service_role;
grant all on table public.zaylo_market_metrics to service_role;
grant all on table public.zaylo_import_runs to service_role;
grant all on table public.zaylo_social_posts to service_role;
grant all on table public.bayut_market_listings to service_role;
grant all on table public.bayut_transactions to service_role;

drop policy if exists "zaylo service role areas" on public.zaylo_areas;
create policy "zaylo service role areas" on public.zaylo_areas for all to service_role using (true) with check (true);

drop policy if exists "zaylo service role source links" on public.zaylo_source_links;
create policy "zaylo service role source links" on public.zaylo_source_links for all to service_role using (true) with check (true);

drop policy if exists "zaylo service role market metrics" on public.zaylo_market_metrics;
create policy "zaylo service role market metrics" on public.zaylo_market_metrics for all to service_role using (true) with check (true);

drop policy if exists "zaylo service role import runs" on public.zaylo_import_runs;
create policy "zaylo service role import runs" on public.zaylo_import_runs for all to service_role using (true) with check (true);

drop policy if exists "zaylo service role social posts" on public.zaylo_social_posts;
create policy "zaylo service role social posts" on public.zaylo_social_posts for all to service_role using (true) with check (true);

drop policy if exists "bayut listings service role" on public.bayut_market_listings;
create policy "bayut listings service role" on public.bayut_market_listings for all to service_role using (true) with check (true);

drop policy if exists "bayut transactions service role" on public.bayut_transactions;
create policy "bayut transactions service role" on public.bayut_transactions for all to service_role using (true) with check (true);

-- Seed source links for villa communities (Hampus Zaylo + team Active Listings)
insert into public.zaylo_areas (slug, master_community, community, sub_community, bayut_path)
values
  ('mudon-al-ranim', 'Mudon', 'Mudon', 'Mudon Al Ranim', 'dubai/mudon/mudon-al-ranim'),
  ('mudon-rahat', 'Mudon', 'Mudon', 'Rahat', 'dubai/mudon/rahat'),
  ('mudon-arabella-townhouses', 'Mudon', 'Mudon', 'Arabella Townhouses', 'dubai/mudon/arabella-townhouses'),
  ('mudon-arabella-1', 'Mudon', 'Mudon', 'Arabella 1', 'dubai/mudon/arabella-1'),
  ('mudon-arabella-2', 'Mudon', 'Mudon', 'Arabella 2', 'dubai/mudon/arabella-2'),
  ('mudon-arabella-3', 'Mudon', 'Mudon', 'Arabella 3', 'dubai/mudon/arabella-3'),
  ('mira-oasis', 'Reem', 'Reem', 'Mira Oasis', 'dubai/reem/mira-oasis')
on conflict (slug) do nothing;

insert into public.zaylo_source_links (area_id, kind, label, url)
select a.id, v.kind, v.label, v.url
from public.zaylo_areas a
join (
  values
    ('mudon-al-ranim', 'bayut_rent_listings', 'Mudon Al Ranim Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/mudon-al-ranim/'),
    ('mudon-rahat', 'bayut_rent_listings', 'Rahat Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/rahat/'),
    ('mudon-arabella-townhouses', 'bayut_rent_listings', 'Arabella Townhouses Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/arabella-townhouses/'),
    ('mudon-arabella-1', 'bayut_rent_listings', 'Arabella 1 Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/arabella-1/'),
    ('mudon-arabella-2', 'bayut_rent_listings', 'Arabella 2 Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/arabella-2/'),
    ('mudon-arabella-3', 'bayut_rent_listings', 'Arabella 3 Rent', 'https://www.bayut.com/to-rent/property/dubai/mudon/arabella-3/'),
    ('mudon-arabella-townhouses', 'bayut_sale_listings', 'Arabella Townhouses Sale', 'https://www.bayut.com/for-sale/property/dubai/mudon/arabella-townhouses/'),
    ('mudon-arabella-1', 'bayut_sale_listings', 'Arabella 1 Sale', 'https://www.bayut.com/for-sale/property/dubai/mudon/arabella-1/'),
    ('mudon-arabella-2', 'bayut_sale_listings', 'Arabella 2 Sale', 'https://www.bayut.com/for-sale/property/dubai/mudon/arabella-2/'),
    ('mudon-arabella-3', 'bayut_sale_listings', 'Arabella 3 Sale', 'https://www.bayut.com/for-sale/property/dubai/mudon/arabella-3/'),
    ('mira-oasis', 'bayut_rent_listings', 'Mira Oasis Rent', 'https://www.bayut.com/to-rent/property/dubai/reem/mira-oasis/'),
    ('mudon-al-ranim', 'bayut_rent_transactions', 'Mudon Al Ranim Rent Tx', 'https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/mudon-al-ranim/'),
    ('mudon-al-ranim', 'bayut_sale_transactions', 'Mudon Al Ranim Sale Tx', 'https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/mudon-al-ranim/'),
    ('mira-oasis', 'bayut_rent_transactions', 'Mira Oasis Rent Tx', 'https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/reem/mira-oasis/'),
    ('mira-oasis', 'bayut_sale_transactions', 'Mira Oasis Sale Tx', 'https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/reem/mira-oasis/')
) as v(slug, kind, label, url) on a.slug = v.slug
where not exists (
  select 1 from public.zaylo_source_links s
  where s.area_id = a.id and s.url = v.url
);
