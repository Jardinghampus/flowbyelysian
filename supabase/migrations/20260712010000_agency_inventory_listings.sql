-- Align remote Zaylo DB with the CRM inventory model used by the Next.js app.
-- Old deed-style listings (if present) are renamed to listing_properties.

do $$ begin
  create type listing_type as enum ('villa', 'apartment', 'townhouse', 'penthouse', 'plot', 'office', 'retail');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type listing_status as enum ('live', 'pocket', 'unofficial');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type inquiry_type as enum ('stock', 'request');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type transaction_type as enum ('sale', 'rent');
exception when duplicate_object then null;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='property_type'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='title'
  ) then
    alter table public.listings rename to listing_properties;
  end if;
end $$;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  area_id uuid,
  area_name text,
  size integer,
  price numeric not null,
  type listing_type not null,
  status listing_status default 'live',
  inquiry_type inquiry_type default 'stock',
  transaction_type transaction_type not null,
  notes text,
  property_finder_url text,
  google_maps_url text,
  images text[] default '{}',
  bedrooms integer,
  bathrooms integer,
  availability text,
  owner_id text not null,
  owner_name text,
  owner_contact_id uuid references owners(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists listings_owner_id_idx on public.listings(owner_id);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_inquiry_type_idx on public.listings(inquiry_type);
create index if not exists listings_area_name_idx on public.listings(area_name);

alter table public.listings enable row level security;
drop policy if exists "service role all agency listings" on public.listings;
create policy "service role all agency listings" on public.listings for all to service_role using (true) with check (true);
grant all on table public.listings to service_role;
