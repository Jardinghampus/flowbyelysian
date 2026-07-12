-- Listing share tokens for colleague preview links (public read-only)

create extension if not exists pgcrypto;

create table if not exists public.listing_shares (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_by text not null,
  created_by_name text not null default '',
  note text not null default '',
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists listing_shares_listing_id_idx on public.listing_shares(listing_id);
create index if not exists listing_shares_token_idx on public.listing_shares(token);
create index if not exists listing_shares_created_by_idx on public.listing_shares(created_by);

alter table public.listing_shares enable row level security;
grant all on table public.listing_shares to service_role;

drop policy if exists "listing shares service" on public.listing_shares;
create policy "listing shares service" on public.listing_shares for all to service_role using (true) with check (true);
