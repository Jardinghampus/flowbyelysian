-- =============================================
-- OWNERS + OUTREACH LOGS for Data Tab
-- =============================================

-- Owners registry
create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  phone text not null,
  whatsapp_number text generated always as (regexp_replace(phone, '[^0-9]', '', 'g')) stored,
  area text not null,
  unit_number text,
  bedrooms text,
  status text check (status in ('owner','considering','listed','sold','unresponsive')) default 'owner',
  priority text check (priority in ('high','medium','low')) default 'medium',
  last_contacted_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  assigned_agent_id text not null,
  assigned_agent_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Outreach log
create table if not exists outreach_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  agent_id text not null,
  agent_name text,
  type text check (type in ('call','whatsapp','email','meeting','sms')) not null,
  outcome text,
  status_changed_to text,
  follow_up_set_to timestamptz,
  logged_at timestamptz default now()
);

-- Indexes
create index if not exists idx_owners_user_id on owners(user_id);
create index if not exists idx_owners_area on owners(user_id, area);
create index if not exists idx_owners_assigned_agent on owners(assigned_agent_id);
create index if not exists idx_owners_follow_up on owners(follow_up_at);
create index if not exists idx_owners_status on owners(status);
create index if not exists idx_owners_last_contacted on owners(last_contacted_at);
create index if not exists idx_outreach_owner on outreach_logs(owner_id);
create index if not exists idx_outreach_agent on outreach_logs(agent_id, logged_at);

-- RLS
alter table owners enable row level security;
alter table outreach_logs enable row level security;

create policy "Owners are viewable by authenticated users" on owners
  for select using (true);
create policy "Users can insert owners" on owners
  for insert with check (true);
create policy "Users can update owners" on owners
  for update using (true);
create policy "Users can delete owners" on owners
  for delete using (true);

create policy "Outreach logs are viewable by authenticated users" on outreach_logs
  for select using (true);
create policy "Users can insert outreach logs" on outreach_logs
  for insert with check (true);
create policy "Users can update outreach logs" on outreach_logs
  for update using (true);

-- Trigger: auto-update last_contacted_at on owners when outreach log is inserted
create or replace function update_owner_last_contacted()
returns trigger as $$
begin
  update owners
  set last_contacted_at = NEW.logged_at,
      updated_at = now()
  where id = NEW.owner_id;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_outreach_update_last_contacted
  after insert on outreach_logs
  for each row
  execute function update_owner_last_contacted();

-- View: owner with outreach counts (for efficient aggregation)
create or replace view owners_with_counts as
select
  o.*,
  coalesce(counts.call_count, 0) as call_count,
  coalesce(counts.whatsapp_count, 0) as whatsapp_count,
  coalesce(counts.total_outreach, 0) as total_outreach
from owners o
left join lateral (
  select
    count(*) filter (where type = 'call') as call_count,
    count(*) filter (where type = 'whatsapp') as whatsapp_count,
    count(*) as total_outreach
  from outreach_logs
  where owner_id = o.id
) counts on true;

-- =============================================
-- SEED DATA - Demo Owners
-- =============================================

insert into owners (user_id, name, phone, area, unit_number, bedrooms, status, priority, last_contacted_at, follow_up_at, notes, assigned_agent_id, assigned_agent_name) values
  ('demo-user-001', 'Khalid Al Maktoum', '+971 50 111 2233', 'Palm Jumeirah', 'F-K-12', '5+', 'owner', 'high', now() - interval '3 days', now() + interval '4 days', 'Very interested in selling. Wants AED 25M+. Beachfront villa on Frond K.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Sarah Mitchell', '+971 55 222 3344', 'Downtown Dubai', 'T2-3405', '3', 'considering', 'high', now() - interval '1 day', now() + interval '2 days', 'Burj Vista 3BR. Considering listing for AED 4.5M. Wants market comparison.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Ahmed Rashid', '+971 50 333 4455', 'Dubai Marina', 'MW-1807', '2', 'listed', 'medium', now() - interval '5 days', now() + interval '7 days', 'Marina Walk 2BR. Already listed at AED 2.8M. Follow up on viewer feedback.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Maria Santos', '+971 52 444 5566', 'Business Bay', 'EX-2201', '1', 'owner', 'low', now() - interval '21 days', now() - interval '7 days', 'Executive Tower 1BR. Not very responsive. Try WhatsApp next time.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'James Wilson', '+971 56 555 6677', 'Emirates Hills', 'EH-V42', '6', 'owner', 'high', now() - interval '2 days', now() + interval '1 day', 'Luxury mansion. Owner based in London. Prefers email communication.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Fatima Al Zaabi', '+971 50 666 7788', 'Tilal Al Ghaf', 'TAG-H2-15', '4', 'considering', 'medium', now() - interval '10 days', now() - interval '3 days', 'Harmony 4BR villa. Wants to sell by Q3. Needs valuation report.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Chen Wei', '+971 55 777 8899', 'JBR', 'SH-1605', '2', 'sold', 'low', now() - interval '30 days', null, 'Sold Shams 2BR for AED 3.2M. Good relationship — ask for referrals.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Omar Khaled', '+971 50 888 9900', 'DIFC', 'IX-4502', 'Studio', 'unresponsive', 'low', now() - interval '45 days', now() - interval '30 days', 'Index Tower studio. No response after 5 attempts. Move to cold list.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Anna Petrova', '+971 52 999 0011', 'Arabian Ranches', 'AR2-V88', '4', 'owner', 'medium', now() - interval '8 days', now() + interval '6 days', 'Ranches 2 villa. Just finished renovation. May list in 6 months.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'David Park', '+971 56 111 2234', 'Dubai Hills', 'DH-V205', '5+', 'considering', 'high', now() - interval '4 days', now() + interval '3 days', 'Dubai Hills villa. Wants to upgrade to Palm. Serious seller.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Aisha Mohammed', '+971 50 222 3345', 'Al Furjan', 'AF-T12', '3', 'owner', 'medium', now() - interval '15 days', now() - interval '1 day', 'Al Furjan townhouse. Renting currently, considering sale.', 'demo-user-001', 'Demo User'),
  ('demo-user-001', 'Robert Taylor', '+971 55 333 4456', 'Palm Jumeirah', 'AT-901', '3', 'listed', 'high', now() - interval '7 days', now() + interval '5 days', 'Atlantis The Royal 3BR. Listed at AED 12M. 2 viewings scheduled.', 'demo-user-001', 'Demo User');

-- =============================================
-- SEED DATA - Demo Outreach Logs
-- =============================================

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'call', 'Initial call — owner interested in valuation', null, now() + interval '7 days', now() - interval '14 days'
from owners o where o.name = 'Khalid Al Maktoum';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'whatsapp', 'Sent market report for Palm Jumeirah', null, now() + interval '4 days', now() - interval '3 days'
from owners o where o.name = 'Khalid Al Maktoum';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'call', 'Discussed listing. Wants to think about it.', 'considering', now() + interval '7 days', now() - interval '10 days'
from owners o where o.name = 'Sarah Mitchell';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'meeting', 'Met at property. Agreed on AED 4.5M listing price.', null, now() + interval '2 days', now() - interval '1 day'
from owners o where o.name = 'Sarah Mitchell';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'call', 'Listed property. Marketing photos scheduled.', 'listed', now() + interval '7 days', now() - interval '14 days'
from owners o where o.name = 'Ahmed Rashid';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'whatsapp', 'Shared 2 viewer feedbacks. Owner happy with progress.', null, now() + interval '7 days', now() - interval '5 days'
from owners o where o.name = 'Ahmed Rashid';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'email', 'Sent introduction email with portfolio.', null, now() + interval '7 days', now() - interval '30 days'
from owners o where o.name = 'James Wilson';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'call', 'Brief call. Interested but traveling until May.', null, now() + interval '1 day', now() - interval '2 days'
from owners o where o.name = 'James Wilson';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'whatsapp', 'Sent valuation report. Awaiting feedback.', 'considering', now() + interval '3 days', now() - interval '4 days'
from owners o where o.name = 'David Park';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'sms', 'No response to 3 calls. Sent SMS.', null, now() - interval '30 days', now() - interval '45 days'
from owners o where o.name = 'Omar Khaled';

insert into outreach_logs (owner_id, agent_id, agent_name, type, outcome, status_changed_to, follow_up_set_to, logged_at)
select o.id, 'demo-user-001', 'Demo User', 'whatsapp', 'Still no response. Mark as unresponsive.', 'unresponsive', null, now() - interval '30 days'
from owners o where o.name = 'Omar Khaled';
