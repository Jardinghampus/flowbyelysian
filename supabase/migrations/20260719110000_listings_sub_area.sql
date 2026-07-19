-- Add sub_area to agency listings (used by inventory + team feed).

alter table public.listings add column if not exists sub_area text;

create index if not exists idx_listings_sub_area on public.listings(sub_area) where sub_area is not null;
