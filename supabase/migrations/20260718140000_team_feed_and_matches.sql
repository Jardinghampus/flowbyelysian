-- Team activity feed + scheduled AI matches (privacy-safe)

create table if not exists public.team_feed_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('listing_live', 'listing_pocket', 'listing_request', 'listing_updated')),
  listing_id uuid not null references public.listings(id) on delete cascade,
  actor_id text not null,
  actor_name text not null default '',
  title text not null default '',
  area_name text not null default '',
  status text not null default '',
  inquiry_type text not null default 'stock',
  transaction_type text not null default 'sale',
  price numeric,
  bedrooms integer,
  property_type text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists team_feed_events_created_idx on public.team_feed_events(created_at desc);
create index if not exists team_feed_events_listing_idx on public.team_feed_events(listing_id);

create table if not exists public.listing_matches (
  id uuid primary key default gen_random_uuid(),
  stock_listing_id uuid not null references public.listings(id) on delete cascade,
  request_listing_id uuid not null references public.listings(id) on delete cascade,
  score numeric not null default 0,
  reasons text[] not null default '{}',
  ai_summary text not null default '',
  model text not null default 'heuristic',
  run_at timestamptz not null default now(),
  unique (stock_listing_id, request_listing_id)
);

create index if not exists listing_matches_score_idx on public.listing_matches(score desc);
create index if not exists listing_matches_run_idx on public.listing_matches(run_at desc);

alter table public.team_feed_events enable row level security;
alter table public.listing_matches enable row level security;

drop policy if exists "service role team feed" on public.team_feed_events;
create policy "service role team feed" on public.team_feed_events for all to service_role using (true) with check (true);

drop policy if exists "service role listing matches" on public.listing_matches;
create policy "service role listing matches" on public.listing_matches for all to service_role using (true) with check (true);

grant all on table public.team_feed_events to service_role;
grant all on table public.listing_matches to service_role;
