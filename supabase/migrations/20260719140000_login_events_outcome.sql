-- Distinguish successful logins from suspicious Hampus login attempts.

alter table public.login_events
  add column if not exists outcome text not null default 'login';

alter table public.login_events
  drop constraint if exists login_events_outcome_check;

alter table public.login_events
  add constraint login_events_outcome_check
  check (outcome in ('login', 'not_you'));

create index if not exists login_events_outcome_idx
  on public.login_events (outcome, logged_in_at desc);
