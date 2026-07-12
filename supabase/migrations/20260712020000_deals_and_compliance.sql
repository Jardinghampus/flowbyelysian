-- Deals lifecycle + Dubai compliance fields on listings

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  opportunity_id uuid,
  owner_contact_id uuid references public.owners(id) on delete set null,
  title text not null,
  deal_type text not null default 'sale' check (deal_type in ('sale', 'rent')),
  status text not null default 'offer' check (status in (
    'offer', 'negotiation', 'mou', 'form_f', 'closed_won', 'closed_lost', 'cancelled'
  )),
  offer_amount numeric,
  agreed_amount numeric,
  currency text not null default 'AED',
  gross_commission numeric,
  company_split_pct numeric default 50,
  agent_split_pct numeric default 50,
  co_broker_name text,
  co_broker_split_pct numeric,
  expected_close_date date,
  closed_at timestamptz,
  commission_paid boolean not null default false,
  commission_paid_at timestamptz,
  trakheesi_permit text,
  form_a_ref text,
  form_b_ref text,
  form_f_ref text,
  mou_ref text,
  notes text,
  agent_id text not null,
  agent_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_agent_id_idx on public.deals(agent_id);
create index if not exists deals_status_idx on public.deals(status);
create index if not exists deals_listing_id_idx on public.deals(listing_id);

alter table public.deals enable row level security;
drop policy if exists "service role all deals" on public.deals;
create policy "service role all deals" on public.deals for all to service_role using (true) with check (true);
grant all on table public.deals to service_role;

alter table public.listings add column if not exists trakheesi_permit text;
alter table public.listings add column if not exists trakheesi_expires_at date;
alter table public.listings add column if not exists agent_brn text;
alter table public.listings add column if not exists office_orn text;
alter table public.listings add column if not exists form_a_signed boolean default false;
alter table public.listings add column if not exists form_b_signed boolean default false;
alter table public.listings add column if not exists form_a_document_id uuid;
alter table public.listings add column if not exists form_b_document_id uuid;
