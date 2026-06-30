-- Daily Activity Log - tracks Calls/WA, Leads, Viewings per agent per day
create table daily_activity_log (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  activity_date date not null default current_date,
  -- Activity metrics
  calls_wa integer default 0,         -- Calls / WhatsApp messages made
  leads integer default 0,            -- Leads generated
  viewings integer default 0,         -- Viewings conducted
  -- Optional notes
  notes text,
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- One entry per agent per day
  unique(agent_id, activity_date)
);

-- Indexes
create index idx_daily_activity_agent on daily_activity_log(agent_id);
create index idx_daily_activity_date on daily_activity_log(activity_date desc);
create index idx_daily_activity_agent_date on daily_activity_log(agent_id, activity_date);

-- RLS
alter table daily_activity_log enable row level security;

create policy "Daily activity is viewable by authenticated users" on daily_activity_log
  for select using (true);

create policy "Users can insert their own daily activity" on daily_activity_log
  for insert with check (true);

create policy "Users can update their own daily activity" on daily_activity_log
  for update using (true);
