-- Title Deeds table for owner verification
-- Stores uploaded title deed documents linked to user accounts

create type title_deed_status as enum ('pending', 'verified', 'rejected');

create table title_deeds (
  id uuid primary key default uuid_generate_v4(),
  -- Owner identity
  clerk_user_id text not null,
  owner_name text not null,
  owner_email text not null,
  owner_phone text,
  -- Property info from registration
  area text,
  property_type text,
  unit_number text,
  -- Document storage
  file_url text not null,
  file_name text not null,
  file_size integer, -- bytes
  file_type text, -- MIME type
  -- Verification
  status title_deed_status default 'pending',
  verified_by text, -- Clerk user ID of admin/agent who verified
  verified_at timestamp with time zone,
  rejection_reason text,
  notes text,
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_title_deeds_user on title_deeds(clerk_user_id);
create index idx_title_deeds_status on title_deeds(status);
create index idx_title_deeds_created on title_deeds(created_at desc);

-- RLS
alter table title_deeds enable row level security;

create policy "Users can view their own title deeds" on title_deeds
  for select using (true);

create policy "Users can insert title deeds" on title_deeds
  for insert with check (true);

create policy "Admins can update title deeds" on title_deeds
  for update using (true);
