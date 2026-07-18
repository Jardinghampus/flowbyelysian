-- Enrich Bayut transactions for market analysis UI (3m sale/rent).
alter table public.bayut_transactions
  add column if not exists sub_area text,
  add column if not exists location text,
  add column if not exists plot_sqft numeric,
  add column if not exists built_up_sqft numeric,
  add column if not exists history text,
  add column if not exists fingerprint text;

create unique index if not exists bayut_transactions_fingerprint_uidx
  on public.bayut_transactions (fingerprint)
  where fingerprint is not null;

create index if not exists bayut_transactions_sub_area_idx on public.bayut_transactions (sub_area);
create index if not exists bayut_transactions_beds_idx on public.bayut_transactions (bedrooms);

drop policy if exists "bayut transactions authenticated read" on public.bayut_transactions;
create policy "bayut transactions authenticated read"
  on public.bayut_transactions for select to authenticated using (true);
