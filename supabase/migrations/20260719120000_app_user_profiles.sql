-- Per-agent profile fields (synced with /app/settings/user).

alter table public.app_users
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists brn text,
  add column if not exists language text default 'english',
  add column if not exists job_title text,
  add column if not exists profile_image_url text;
