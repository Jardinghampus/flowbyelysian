-- Media Desk OS + opportunities (Zaylo)
alter table public.zaylo_social_posts
  add column if not exists schedule_key text,
  add column if not exists community_id text,
  add column if not exists concept text,
  add column if not exists caption_ig text,
  add column if not exists caption_li text,
  add column if not exists posted_ig_at timestamptz,
  add column if not exists posted_li_at timestamptz,
  add column if not exists desk_status text default 'ready',
  add column if not exists narrative text;

create unique index if not exists zaylo_social_posts_schedule_key_uidx
  on public.zaylo_social_posts (schedule_key)
  where schedule_key is not null;

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'buy',
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  preferred_contact text,
  area text,
  sub_area text,
  unit_number text,
  floor text,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  size numeric,
  furnished text,
  parking text,
  year_built integer,
  price numeric,
  price_type text,
  min_price numeric,
  max_price numeric,
  features text[] default '{}',
  availability text,
  notes text,
  ai_price_summary text,
  market_comparison_pct numeric,
  status text not null default 'new',
  source text not null default 'website',
  media_post_id text,
  qualify_budget_aed numeric,
  qualify_beds integer,
  qualify_communities text[] default '{}',
  qualify_timeline text,
  qualify_finance text,
  qualify_intent text,
  shortlist_listing_ids uuid[] default '{}',
  shortlist_notes text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;
grant all on table public.opportunities to service_role;
grant select, insert, update, delete on table public.opportunities to authenticated;

drop policy if exists "opportunities authenticated" on public.opportunities;
create policy "opportunities authenticated"
  on public.opportunities for all to authenticated using (true) with check (true);

create table if not exists public.media_shortlists (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  title text not null default 'Shortlist',
  listing_ids uuid[] not null default '{}',
  comp_notes jsonb not null default '[]'::jsonb,
  proof_post_id text,
  sent_at timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.media_shortlists enable row level security;
grant all on table public.media_shortlists to service_role;
grant select, insert, update, delete on table public.media_shortlists to authenticated;

drop policy if exists "media shortlists authenticated" on public.media_shortlists;
create policy "media shortlists authenticated"
  on public.media_shortlists for all to authenticated using (true) with check (true);

drop policy if exists "zaylo social posts authenticated read" on public.zaylo_social_posts;
create policy "zaylo social posts authenticated read"
  on public.zaylo_social_posts for select to authenticated using (true);

drop policy if exists "zaylo social posts authenticated write" on public.zaylo_social_posts;
create policy "zaylo social posts authenticated write"
  on public.zaylo_social_posts for all to authenticated using (true) with check (true);
