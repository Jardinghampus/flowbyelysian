-- Temp password onboarding: force users to set their own password after first login.

alter table public.app_users
  add column if not exists must_change_password boolean not null default false;
