-- Per-row Bayut transaction detail / view link (for open-in-Bayut + periodic checks).
alter table public.bayut_transactions
  add column if not exists detail_url text;

create index if not exists bayut_transactions_detail_url_idx
  on public.bayut_transactions (detail_url)
  where detail_url is not null;
