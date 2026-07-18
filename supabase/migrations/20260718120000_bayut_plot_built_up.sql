-- Split build-up vs plot size for Active Listings (villa/townhouse brokers).

alter table public.bayut_market_listings
  add column if not exists built_up_sqft numeric,
  add column if not exists plot_sqft numeric,
  add column if not exists sub_area text not null default '';

-- Backfill built_up from legacy size_sqft when empty.
update public.bayut_market_listings
set built_up_sqft = size_sqft
where built_up_sqft is null and size_sqft is not null;

-- Prefer location leftovers as sub_area when blank.
update public.bayut_market_listings
set sub_area = coalesce(nullif(trim(location), ''), community)
where sub_area = '';
