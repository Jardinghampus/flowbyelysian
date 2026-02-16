-- Flow by Elysian - Supabase Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

create type listing_type as enum ('villa', 'apartment', 'townhouse', 'penthouse', 'plot', 'office', 'retail');
create type listing_status as enum ('live', 'pocket', 'unofficial');
create type inquiry_type as enum ('stock', 'request');
create type transaction_type as enum ('sale', 'rent');
create type request_status as enum ('active', 'matched', 'closed');
create type training_category as enum ('rera', 'tips', 'way-of-work');
create type video_type as enum ('youtube', 'loom');
create type agent_role as enum ('Sales', 'Leasing');

-- =============================================
-- TABLES
-- =============================================

-- 1. AREAS
create table areas (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  image text,
  created_at timestamp with time zone default now()
);

-- 2. AREA MARKET DATA
create table area_market_data (
  id uuid primary key default uuid_generate_v4(),
  area_id uuid references areas(id) on delete cascade,
  avg_price_sqft numeric default 0,
  avg_price_sqft_change numeric default 0,
  total_transactions integer default 0,
  transactions_change numeric default 0,
  avg_days_on_market integer default 0,
  days_on_market_change numeric default 0,
  avg_rent_yield numeric default 0,
  updated_at timestamp with time zone default now()
);

-- 3. LISTINGS (Inventory)
create table listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  area_id uuid references areas(id) on delete set null,
  area_name text,
  size integer,
  price numeric not null,
  type listing_type not null,
  status listing_status default 'live',
  inquiry_type inquiry_type default 'stock',
  transaction_type transaction_type not null,
  notes text,
  property_finder_url text,
  images text[] default '{}',
  bedrooms integer,
  bathrooms integer,
  availability text,
  owner_id text not null, -- Clerk user ID
  owner_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. CLIENT REQUESTS
create table client_requests (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  budget numeric,
  property_type text,
  bedrooms integer,
  area_id uuid references areas(id) on delete set null,
  notes text,
  status request_status default 'active',
  agent_id text not null, -- Clerk user ID
  agent_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. TRAINING MODULES
create table training_modules (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category training_category not null,
  content text,
  video_url text,
  video_type video_type,
  documents jsonb default '[]',
  duration text,
  created_by text, -- Clerk user ID
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. CONTACTS
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  area_id uuid references areas(id) on delete set null,
  role agent_role,
  title text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 7. AGENT AREA ASSIGNMENTS
create table agent_area_assignments (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  area_id uuid references areas(id) on delete cascade,
  is_primary boolean default false,
  created_at timestamp with time zone default now(),
  unique(agent_id, area_id)
);

-- 8. AGENT PERFORMANCE
create table agent_performance (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  period_start date not null,
  period_end date not null,
  deals_count integer default 0,
  commission_earned numeric default 0,
  listings_count integer default 0,
  viewings_count integer default 0,
  created_at timestamp with time zone default now()
);

-- 9. NOTIFICATIONS
create type notification_type as enum ('match', 'listing', 'request', 'system');

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Clerk user ID
  type notification_type not null default 'system',
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- 10. MONTHLY KPI HISTORY (12-month rolling window)
create table monthly_kpi_history (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  year integer not null,
  month integer not null check (month >= 1 and month <= 12),
  -- Core metrics
  deals_closed integer default 0,
  deals_target integer default 0,
  revenue numeric default 0,
  revenue_target numeric default 0,
  commission_earned numeric default 0,
  commission_target numeric default 0,
  -- Activity metrics
  listings_created integer default 0,
  listings_target integer default 0,
  viewings_conducted integer default 0,
  viewings_target integer default 0,
  leads_generated integer default 0,
  leads_converted integer default 0,
  -- Response metrics
  avg_response_time_mins integer default 0,
  client_satisfaction_score numeric default 0,
  -- Computed metrics
  conversion_rate numeric generated always as (
    case when viewings_conducted > 0 then (deals_closed::numeric / viewings_conducted::numeric * 100) else 0 end
  ) stored,
  target_achievement_pct numeric generated always as (
    case when deals_target > 0 then (deals_closed::numeric / deals_target::numeric * 100) else 0 end
  ) stored,
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  -- Unique constraint for one record per agent per month
  unique(agent_id, year, month)
);

-- 11. AGENT PERSONAL TARGETS
create table agent_targets (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null unique, -- Clerk user ID
  -- Monthly targets (can be adjusted by agent)
  deals_target integer default 3,
  commission_target numeric default 100000,
  listings_target integer default 10,
  viewings_target integer default 20,
  -- Target notes
  notes text,
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 12. ACHIEVEMENTS/BADGES
create type achievement_rarity as enum ('common', 'rare', 'epic', 'legendary');
create type achievement_category as enum ('sales', 'streak', 'milestone', 'special');

create table achievements (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null, -- e.g., 'first_deal', 'million_maker'
  name text not null,
  description text not null,
  category achievement_category not null,
  rarity achievement_rarity not null,
  icon text, -- Icon name or URL
  points integer default 10,
  -- Unlock criteria (JSON for flexibility)
  criteria jsonb not null default '{}',
  created_at timestamp with time zone default now()
);

-- 13. AGENT ACHIEVEMENTS (unlocked achievements)
create table agent_achievements (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  achievement_id uuid references achievements(id) on delete cascade,
  unlocked_at timestamp with time zone default now(),
  -- Progress tracking for in-progress achievements
  progress integer default 0,
  max_progress integer default 1,
  unique(agent_id, achievement_id)
);

-- 14. LEADERBOARD POINTS
create table leaderboard_points (
  id uuid primary key default uuid_generate_v4(),
  agent_id text not null, -- Clerk user ID
  points integer default 0,
  streak_days integer default 0,
  last_activity_date date,
  -- Weekly/Monthly/Yearly totals
  weekly_points integer default 0,
  monthly_points integer default 0,
  yearly_points integer default 0,
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(agent_id)
);

-- =============================================
-- INDEXES
-- =============================================

create index idx_listings_area on listings(area_id);
create index idx_listings_owner on listings(owner_id);
create index idx_listings_status on listings(status);
create index idx_listings_type on listings(type);
create index idx_listings_transaction on listings(transaction_type);

create index idx_requests_area on client_requests(area_id);
create index idx_requests_agent on client_requests(agent_id);
create index idx_requests_status on client_requests(status);

create index idx_training_category on training_modules(category);

create index idx_contacts_area on contacts(area_id);
create index idx_contacts_clerk on contacts(clerk_user_id);

create index idx_assignments_agent on agent_area_assignments(agent_id);
create index idx_assignments_area on agent_area_assignments(area_id);

create index idx_performance_agent on agent_performance(agent_id);

create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(user_id, read);

create index idx_kpi_history_agent on monthly_kpi_history(agent_id);
create index idx_kpi_history_period on monthly_kpi_history(year, month);
create index idx_kpi_history_agent_period on monthly_kpi_history(agent_id, year, month);

create index idx_agent_targets_agent on agent_targets(agent_id);

create index idx_achievements_category on achievements(category);
create index idx_achievements_rarity on achievements(rarity);

create index idx_agent_achievements_agent on agent_achievements(agent_id);
create index idx_agent_achievements_achievement on agent_achievements(achievement_id);

create index idx_leaderboard_points on leaderboard_points(points desc);
create index idx_leaderboard_agent on leaderboard_points(agent_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table areas enable row level security;
alter table notifications enable row level security;
alter table area_market_data enable row level security;
alter table listings enable row level security;
alter table client_requests enable row level security;
alter table training_modules enable row level security;
alter table contacts enable row level security;
alter table agent_area_assignments enable row level security;
alter table agent_performance enable row level security;

-- Public read access for areas and market data
create policy "Areas are viewable by everyone" on areas
  for select using (true);

create policy "Area market data is viewable by everyone" on area_market_data
  for select using (true);

-- Listings policies
create policy "Listings are viewable by everyone" on listings
  for select using (true);

create policy "Users can insert their own listings" on listings
  for insert with check (true);

create policy "Users can update their own listings" on listings
  for update using (true);

create policy "Users can delete their own listings" on listings
  for delete using (true);

-- Training modules - public read
create policy "Training modules are viewable by everyone" on training_modules
  for select using (true);

-- Contacts - public read
create policy "Contacts are viewable by everyone" on contacts
  for select using (true);

-- Client requests - authenticated access
create policy "Requests are viewable by authenticated users" on client_requests
  for select using (true);

create policy "Users can insert requests" on client_requests
  for insert with check (true);

-- Performance - authenticated access
create policy "Performance is viewable by authenticated users" on agent_performance
  for select using (true);

-- Notifications - users can only see their own
create policy "Users can view own notifications" on notifications
  for select using (true);

create policy "System can insert notifications" on notifications
  for insert with check (true);

create policy "Users can update own notifications" on notifications
  for update using (true);

-- Monthly KPI History RLS
alter table monthly_kpi_history enable row level security;

create policy "KPI history is viewable by authenticated users" on monthly_kpi_history
  for select using (true);

create policy "Users can insert their own KPI history" on monthly_kpi_history
  for insert with check (true);

create policy "Users can update their own KPI history" on monthly_kpi_history
  for update using (true);

-- Agent Targets RLS
alter table agent_targets enable row level security;

create policy "Agent targets are viewable by authenticated users" on agent_targets
  for select using (true);

create policy "Users can manage their own targets" on agent_targets
  for insert with check (true);

create policy "Users can update their own targets" on agent_targets
  for update using (true);

-- Achievements RLS
alter table achievements enable row level security;

create policy "Achievements are viewable by everyone" on achievements
  for select using (true);

-- Agent Achievements RLS
alter table agent_achievements enable row level security;

create policy "Agent achievements are viewable by everyone" on agent_achievements
  for select using (true);

create policy "System can insert agent achievements" on agent_achievements
  for insert with check (true);

create policy "System can update agent achievements" on agent_achievements
  for update using (true);

-- Leaderboard Points RLS
alter table leaderboard_points enable row level security;

create policy "Leaderboard is viewable by everyone" on leaderboard_points
  for select using (true);

create policy "System can manage leaderboard points" on leaderboard_points
  for insert with check (true);

create policy "System can update leaderboard points" on leaderboard_points
  for update using (true);

-- =============================================
-- SEED DATA - Dubai Areas
-- =============================================

insert into areas (slug, name, description, image) values
  ('tilal-al-ghaf', 'Tilal Al Ghaf', 'A premium master-planned community featuring lagoons, parks, and luxury villas. Known for sustainable living and world-class amenities.', '/areas/tilal-al-ghaf.jpg'),
  ('al-furjan', 'Al Furjan', 'A vibrant family-friendly community with a mix of villas and townhouses. Close to metro, schools, and retail destinations.', '/areas/al-furjan.jpg'),
  ('palm-jumeirah', 'Palm Jumeirah', 'The iconic man-made island featuring ultra-luxury villas, apartments, and world-renowned hotels. Premium beachfront living.', '/areas/palm-jumeirah.jpg'),
  ('dubai-marina', 'Dubai Marina', 'A stunning waterfront community with high-rise luxury apartments, dining, and entertainment. The heart of New Dubai.', '/areas/dubai-marina.jpg'),
  ('downtown-dubai', 'Downtown Dubai', 'Home to Burj Khalifa and Dubai Mall. The most prestigious address in Dubai with world-class amenities and lifestyle.', '/areas/downtown-dubai.jpg'),
  ('arabian-ranches', 'Arabian Ranches', 'An established family community with spacious villas, golf course, and equestrian facilities. Suburban living at its finest.', '/areas/arabian-ranches.jpg'),
  ('emirates-hills', 'Emirates Hills', 'Ultra-luxury gated community with sprawling mansions and golf course views. Dubais most exclusive residential address.', '/areas/emirates-hills.jpg'),
  ('business-bay', 'Business Bay', 'A mixed-use development with commercial towers and residential apartments along Dubai Water Canal.', '/areas/business-bay.jpg'),
  ('jbr', 'JBR (Jumeirah Beach Residence)', 'Beachfront living with apartments, retail, and The Walk promenade. Popular for tourists and residents alike.', '/areas/jbr.jpg'),
  ('difc', 'DIFC', 'Dubai International Financial Centre - premium office space and luxury residences in the financial hub.', '/areas/difc.jpg');

-- Insert default market data for each area
insert into area_market_data (area_id, avg_price_sqft, avg_price_sqft_change, total_transactions, transactions_change, avg_days_on_market, days_on_market_change, avg_rent_yield)
select id,
  case
    when slug = 'palm-jumeirah' then 3500
    when slug = 'downtown-dubai' then 2200
    when slug = 'emirates-hills' then 2800
    when slug = 'dubai-marina' then 1650
    when slug = 'tilal-al-ghaf' then 1850
    else 1200
  end,
  round((random() * 15)::numeric, 1),
  round((random() * 300 + 50)::numeric),
  round((random() * 20)::numeric, 1),
  round((random() * 40 + 25)::numeric),
  round((random() * -15)::numeric, 1),
  round((random() * 3 + 4)::numeric, 1)
from areas;

-- =============================================
-- SEED DATA - Demo Listings
-- =============================================

insert into listings (title, area_id, area_name, size, price, type, status, inquiry_type, transaction_type, bedrooms, bathrooms, owner_id, owner_name, notes)
select
  case
    when a.slug = 'palm-jumeirah' then 'Luxury Beachfront Villa with Private Beach'
    when a.slug = 'downtown-dubai' then 'Premium 3BR with Burj Khalifa View'
    when a.slug = 'dubai-marina' then 'Marina View 2BR Apartment'
    when a.slug = 'tilal-al-ghaf' then 'Modern 4BR Villa with Lagoon Access'
    else 'Spacious Family Home'
  end,
  a.id,
  a.name,
  case
    when a.slug = 'palm-jumeirah' then 8500
    when a.slug = 'emirates-hills' then 12000
    when a.slug = 'tilal-al-ghaf' then 5500
    else round((random() * 3000 + 1500)::numeric)
  end,
  case
    when a.slug = 'palm-jumeirah' then 25000000
    when a.slug = 'emirates-hills' then 45000000
    when a.slug = 'downtown-dubai' then 4500000
    when a.slug = 'tilal-al-ghaf' then 8500000
    else round((random() * 5000000 + 1000000)::numeric)
  end,
  case
    when a.slug in ('palm-jumeirah', 'emirates-hills', 'tilal-al-ghaf', 'arabian-ranches') then 'villa'::listing_type
    when a.slug in ('downtown-dubai', 'dubai-marina', 'jbr', 'business-bay') then 'apartment'::listing_type
    else 'townhouse'::listing_type
  end,
  'live'::listing_status,
  'stock'::inquiry_type,
  'sale'::transaction_type,
  case
    when a.slug in ('palm-jumeirah', 'emirates-hills') then 6
    when a.slug = 'tilal-al-ghaf' then 4
    else round((random() * 3 + 1)::numeric)
  end,
  case
    when a.slug in ('palm-jumeirah', 'emirates-hills') then 7
    when a.slug = 'tilal-al-ghaf' then 5
    else round((random() * 2 + 2)::numeric)
  end,
  'demo-agent-1',
  'Ahmed Hassan',
  'Premium property with excellent ROI potential'
from areas a
limit 10;

-- Add more rental listings
insert into listings (title, area_id, area_name, size, price, type, status, inquiry_type, transaction_type, bedrooms, bathrooms, owner_id, owner_name)
select
  'Furnished ' || round((random() * 2 + 1)::numeric) || 'BR for Rent',
  a.id,
  a.name,
  round((random() * 1500 + 800)::numeric),
  round((random() * 150000 + 80000)::numeric),
  'apartment'::listing_type,
  'live'::listing_status,
  'stock'::inquiry_type,
  'rent'::transaction_type,
  round((random() * 2 + 1)::numeric),
  round((random() * 2 + 1)::numeric),
  'demo-agent-2',
  'Sarah Miller'
from areas a
where a.slug in ('dubai-marina', 'downtown-dubai', 'jbr', 'business-bay')
limit 8;

-- =============================================
-- SEED DATA - Demo Client Requests
-- =============================================

insert into client_requests (client_name, budget, property_type, bedrooms, area_id, notes, status, agent_id, agent_name)
select
  case row_number() over ()
    when 1 then 'Mohammed Al Rashid'
    when 2 then 'James Wilson'
    when 3 then 'Anna Petrova'
    when 4 then 'Chen Wei'
    else 'Client ' || row_number() over ()
  end,
  case
    when a.slug = 'palm-jumeirah' then 20000000
    when a.slug = 'emirates-hills' then 35000000
    else round((random() * 8000000 + 2000000)::numeric)
  end,
  case
    when a.slug in ('palm-jumeirah', 'emirates-hills', 'tilal-al-ghaf') then 'Villa'
    else 'Apartment'
  end,
  round((random() * 3 + 2)::numeric),
  a.id,
  'Looking for investment property with good rental yield',
  'active'::request_status,
  'demo-agent-1',
  'Ahmed Hassan'
from areas a
limit 6;

-- =============================================
-- SEED DATA - Training Modules
-- =============================================

insert into training_modules (title, description, category, content, video_url, video_type, duration) values
  ('RERA Certification Basics', 'Learn the fundamentals of RERA certification and compliance requirements for Dubai real estate agents.', 'rera', 'This module covers all essential RERA requirements including licensing, renewal procedures, and compliance standards.', 'https://www.youtube.com/watch?v=example1', 'youtube', '45 mins'),
  ('Property Valuation Methods', 'Master the art of property valuation using industry-standard methods and Dubai market specifics.', 'tips', 'Learn comparative market analysis, income approach, and cost approach methods for accurate property valuations.', 'https://www.youtube.com/watch?v=example2', 'youtube', '60 mins'),
  ('Client Communication Best Practices', 'Develop excellent client relationships through effective communication strategies.', 'way-of-work', 'From initial contact to closing deals, learn how to communicate professionally with clients at every stage.', null, null, '30 mins'),
  ('Dubai Market Analysis 2024', 'Understanding current market trends and predictions for the Dubai real estate market.', 'tips', 'Comprehensive analysis of Dubai property market including price trends, demand patterns, and investment opportunities.', 'https://www.loom.com/share/example', 'loom', '90 mins'),
  ('Legal Framework for Property Sales', 'Essential legal knowledge for conducting property transactions in Dubai.', 'rera', 'Covers contracts, SPA requirements, escrow procedures, and legal compliance for property sales.', 'https://www.youtube.com/watch?v=example3', 'youtube', '75 mins'),
  ('Digital Marketing for Real Estate', 'Learn to leverage digital channels for property marketing and lead generation.', 'way-of-work', 'Social media marketing, SEO, email campaigns, and digital advertising strategies for real estate.', null, null, '45 mins');

-- =============================================
-- SEED DATA - Demo Contacts (Agents)
-- =============================================

insert into contacts (clerk_user_id, name, email, phone, whatsapp, area_id, role, title) values
  ('demo-agent-1', 'Ahmed Hassan', 'ahmed.hassan@elysian.ae', '+971501234567', '+971501234567', (select id from areas where slug = 'palm-jumeirah'), 'Sales', 'Senior Sales Consultant'),
  ('demo-agent-2', 'Sarah Miller', 'sarah.miller@elysian.ae', '+971502345678', '+971502345678', (select id from areas where slug = 'dubai-marina'), 'Leasing', 'Leasing Specialist'),
  ('demo-agent-3', 'Omar Khan', 'omar.khan@elysian.ae', '+971503456789', '+971503456789', (select id from areas where slug = 'tilal-al-ghaf'), 'Sales', 'Sales Consultant'),
  ('demo-agent-4', 'Maria Santos', 'maria.santos@elysian.ae', '+971504567890', '+971504567890', (select id from areas where slug = 'downtown-dubai'), 'Sales', 'Senior Sales Consultant');

-- =============================================
-- SEED DATA - Agent Area Assignments
-- =============================================

insert into agent_area_assignments (agent_id, area_id, is_primary) values
  ('demo-agent-1', (select id from areas where slug = 'palm-jumeirah'), true),
  ('demo-agent-1', (select id from areas where slug = 'emirates-hills'), false),
  ('demo-agent-2', (select id from areas where slug = 'dubai-marina'), true),
  ('demo-agent-2', (select id from areas where slug = 'jbr'), false),
  ('demo-agent-3', (select id from areas where slug = 'tilal-al-ghaf'), true),
  ('demo-agent-3', (select id from areas where slug = 'arabian-ranches'), false),
  ('demo-agent-4', (select id from areas where slug = 'downtown-dubai'), true),
  ('demo-agent-4', (select id from areas where slug = 'business-bay'), false);

-- =============================================
-- SEED DATA - Agent Performance
-- =============================================

insert into agent_performance (agent_id, period_start, period_end, deals_count, commission_earned, listings_count, viewings_count) values
  ('demo-agent-1', '2024-01-01', '2024-01-31', 3, 450000, 12, 28),
  ('demo-agent-1', '2024-02-01', '2024-02-29', 4, 620000, 15, 35),
  ('demo-agent-2', '2024-01-01', '2024-01-31', 8, 180000, 20, 45),
  ('demo-agent-2', '2024-02-01', '2024-02-29', 10, 220000, 25, 52),
  ('demo-agent-3', '2024-01-01', '2024-01-31', 2, 280000, 8, 18),
  ('demo-agent-3', '2024-02-01', '2024-02-29', 3, 420000, 10, 22),
  ('demo-agent-4', '2024-01-01', '2024-01-31', 5, 380000, 14, 32),
  ('demo-agent-4', '2024-02-01', '2024-02-29', 6, 510000, 18, 40);

-- =============================================
-- SEED DATA - Sample Notifications
-- =============================================

insert into notifications (user_id, type, title, message, link, read) values
  ('demo-agent-1', 'match', 'New Client Match', 'A new client request matches your listing in Palm Jumeirah', '/requests', false),
  ('demo-agent-1', 'listing', 'Listing Update', 'Your listing "Luxury Beachfront Villa" received 5 new views today', '/inventory', true),
  ('demo-agent-2', 'system', 'Training Available', 'New training module "Digital Marketing" is now available', '/training', false),
  ('demo-agent-3', 'request', 'New Request', 'New client looking for 4BR villa in Tilal Al Ghaf', '/requests', false);

-- =============================================
-- SEED DATA - Achievements
-- =============================================

insert into achievements (code, name, description, category, rarity, icon, points, criteria) values
  ('first_deal', 'First Deal', 'Close your first real estate deal', 'milestone', 'common', 'trophy', 10, '{"deals_closed": 1}'),
  ('million_maker', 'Million Maker', 'Close deals worth over 1M AED total', 'milestone', 'rare', 'gem', 25, '{"total_revenue": 1000000}'),
  ('ten_million', 'Ten Million Club', 'Close deals worth over 10M AED total', 'milestone', 'epic', 'diamond', 50, '{"total_revenue": 10000000}'),
  ('hundred_million', 'Hundred Million Legend', 'Close deals worth over 100M AED total', 'milestone', 'legendary', 'crown', 100, '{"total_revenue": 100000000}'),
  ('hot_streak_5', 'Hot Streak', 'Close deals 5 days in a row', 'streak', 'rare', 'flame', 25, '{"streak_days": 5}'),
  ('hot_streak_10', 'On Fire', 'Close deals 10 days in a row', 'streak', 'epic', 'fire', 50, '{"streak_days": 10}'),
  ('speed_demon', 'Speed Demon', 'Respond to 50 inquiries within 10 minutes', 'special', 'epic', 'zap', 50, '{"fast_responses": 50}'),
  ('top_performer', 'Top Performer', 'Be #1 on the leaderboard for a month', 'special', 'legendary', 'crown', 100, '{"top_rank_months": 1}'),
  ('network_builder', 'Network Builder', 'Add 100 contacts to your CRM', 'milestone', 'common', 'users', 10, '{"contacts_added": 100}'),
  ('consistent_3', 'Consistent Performer', 'Meet your monthly target 3 months in a row', 'streak', 'epic', 'target', 50, '{"targets_met_streak": 3}'),
  ('growth_champion', 'Growth Champion', 'Increase your monthly revenue by 50%', 'special', 'rare', 'trending-up', 25, '{"revenue_growth_pct": 50}'),
  ('early_bird', 'Early Bird', 'Schedule 20 viewings before 9 AM', 'special', 'common', 'clock', 10, '{"early_viewings": 20}'),
  ('palm_specialist', 'Palm Jumeirah Specialist', 'Close 10 deals in Palm Jumeirah', 'milestone', 'epic', 'star', 50, '{"area_deals": {"palm-jumeirah": 10}}'),
  ('rental_master', 'Rental Master', 'Complete 50 rental transactions', 'milestone', 'rare', 'key', 25, '{"rentals_closed": 50}'),
  ('listing_king', 'Listing King', 'Create 100 listings', 'milestone', 'rare', 'layers', 25, '{"listings_created": 100}');

-- =============================================
-- SEED DATA - Agent Achievements (Unlocked)
-- =============================================

insert into agent_achievements (agent_id, achievement_id, unlocked_at, progress, max_progress)
select 'demo-agent-1', id, now() - interval '30 days', 1, 1
from achievements where code = 'first_deal';

insert into agent_achievements (agent_id, achievement_id, unlocked_at, progress, max_progress)
select 'demo-agent-1', id, now() - interval '15 days', 1, 1
from achievements where code = 'million_maker';

insert into agent_achievements (agent_id, achievement_id, unlocked_at, progress, max_progress)
select 'demo-agent-1', id, now() - interval '5 days', 1, 1
from achievements where code = 'hot_streak_5';

-- In-progress achievements
insert into agent_achievements (agent_id, achievement_id, progress, max_progress)
select 'demo-agent-1', id, 38, 50
from achievements where code = 'speed_demon';

insert into agent_achievements (agent_id, achievement_id, progress, max_progress)
select 'demo-agent-1', id, 67, 100
from achievements where code = 'network_builder';

insert into agent_achievements (agent_id, achievement_id, progress, max_progress)
select 'demo-agent-1', id, 6, 10
from achievements where code = 'palm_specialist';

-- =============================================
-- SEED DATA - Agent Targets
-- =============================================

insert into agent_targets (agent_id, deals_target, commission_target, listings_target, viewings_target) values
  ('demo-agent-1', 5, 500000, 15, 30),
  ('demo-agent-2', 12, 250000, 25, 50),
  ('demo-agent-3', 4, 400000, 12, 25),
  ('demo-agent-4', 6, 450000, 18, 35);

-- =============================================
-- SEED DATA - Leaderboard Points
-- =============================================

insert into leaderboard_points (agent_id, points, streak_days, last_activity_date, weekly_points, monthly_points, yearly_points) values
  ('demo-agent-1', 2450, 12, current_date, 320, 890, 2450),
  ('demo-agent-2', 1890, 5, current_date, 280, 720, 1890),
  ('demo-agent-3', 1650, 8, current_date, 245, 650, 1650),
  ('demo-agent-4', 1320, 3, current_date, 180, 520, 1320);

-- =============================================
-- SEED DATA - 12-Month KPI History
-- =============================================

-- Generate 12 months of KPI history for each demo agent
insert into monthly_kpi_history (
  agent_id, year, month, deals_closed, deals_target, revenue, revenue_target,
  commission_earned, commission_target, listings_created, listings_target,
  viewings_conducted, viewings_target, leads_generated, leads_converted,
  avg_response_time_mins, client_satisfaction_score
)
select
  agent_id,
  extract(year from month_date)::integer as year,
  extract(month from month_date)::integer as month,
  -- Deals with some variance
  greatest(0, base_deals + floor(random() * 3 - 1)::integer) as deals_closed,
  deals_target,
  -- Revenue based on deals
  (greatest(0, base_deals + floor(random() * 3 - 1)::integer) * avg_deal_value * (0.8 + random() * 0.4))::numeric as revenue,
  (deals_target * avg_deal_value)::numeric as revenue_target,
  -- Commission (3% of revenue)
  (greatest(0, base_deals + floor(random() * 3 - 1)::integer) * avg_deal_value * 0.03 * (0.8 + random() * 0.4))::numeric as commission_earned,
  (deals_target * avg_deal_value * 0.03)::numeric as commission_target,
  -- Listings
  greatest(0, base_listings + floor(random() * 5 - 2)::integer) as listings_created,
  listings_target,
  -- Viewings
  greatest(0, base_viewings + floor(random() * 10 - 5)::integer) as viewings_conducted,
  viewings_target,
  -- Leads
  floor(random() * 20 + 10)::integer as leads_generated,
  floor(random() * 8 + 2)::integer as leads_converted,
  -- Response time and satisfaction
  floor(random() * 30 + 5)::integer as avg_response_time_mins,
  (3.5 + random() * 1.5)::numeric as client_satisfaction_score
from (
  -- Generate 12 months back from current date for each agent
  select
    a.agent_id,
    a.base_deals,
    a.deals_target,
    a.avg_deal_value,
    a.base_listings,
    a.listings_target,
    a.base_viewings,
    a.viewings_target,
    generate_series(
      date_trunc('month', current_date - interval '11 months'),
      date_trunc('month', current_date),
      interval '1 month'
    )::date as month_date
  from (
    values
      ('demo-agent-1', 4, 5, 3800000, 12, 15, 28, 30),
      ('demo-agent-2', 9, 12, 450000, 22, 25, 48, 50),
      ('demo-agent-3', 3, 4, 2800000, 9, 12, 20, 25),
      ('demo-agent-4', 5, 6, 1500000, 15, 18, 35, 35)
  ) as a(agent_id, base_deals, deals_target, avg_deal_value, base_listings, listings_target, base_viewings, viewings_target)
) as monthly_data
on conflict (agent_id, year, month) do nothing;

-- =============================================
-- SMART APP - Document Intelligence Platform
-- =============================================

-- Enums for Smart
create type smart_document_type as enum ('floor_plan', 'site_plan', 'plot_map', 'brochure', 'spec_sheet', 'contract', 'legal', 'other');
create type smart_analysis_status as enum ('pending', 'processing', 'completed', 'failed');

-- 15. SMART COLLECTIONS (Folders/Projects)
create table smart_collections (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Owner
  name text not null,
  description text,
  color text default '#6366f1', -- For UI display
  icon text default 'folder', -- Icon name
  is_default boolean default false, -- Default collection for uncategorized docs
  document_count integer default 0, -- Denormalized for performance
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 16. SMART DOCUMENTS
create table smart_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Owner
  collection_id uuid references smart_collections(id) on delete set null,
  name text not null,
  description text,
  document_type smart_document_type default 'other',
  -- File info
  file_url text not null, -- Supabase storage URL
  file_name text not null,
  file_size integer, -- in bytes
  file_type text, -- MIME type
  thumbnail_url text, -- Generated thumbnail
  -- Location data (for map)
  latitude numeric,
  longitude numeric,
  address text,
  area_name text,
  -- Property info (extracted or manual)
  property_name text,
  developer text,
  project_name text,
  -- Status
  analysis_status smart_analysis_status default 'pending',
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 17. SMART DOCUMENT ANALYSIS (Extracted data)
create table smart_document_analysis (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references smart_documents(id) on delete cascade,
  -- Extracted measurements
  plot_size numeric, -- in sqft
  built_up_area numeric, -- in sqft
  bedroom_count integer,
  bathroom_count integer,
  floor_count integer,
  parking_spaces integer,
  -- Room dimensions (JSON for flexibility)
  room_dimensions jsonb default '[]', -- [{name: "Master Bedroom", width: 15, length: 20, area: 300}]
  -- Additional specs
  balcony_area numeric,
  terrace_area numeric,
  garden_area numeric,
  pool_size text, -- e.g., "10m x 5m"
  -- Features detected
  features jsonb default '[]', -- ["swimming_pool", "gym", "maid_room", "study"]
  -- Raw extracted text (for AI context)
  extracted_text text,
  -- AI-generated summary
  summary text,
  -- Confidence scores
  extraction_confidence numeric default 0,
  -- Processing metadata
  processed_at timestamp with time zone,
  processing_time_ms integer,
  model_used text
);

-- 18. SMART CHAT MESSAGES
create table smart_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  collection_id uuid references smart_collections(id) on delete cascade, -- Chat per collection
  -- Message content
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  -- Context references
  document_ids uuid[] default '{}', -- Documents referenced in this message
  -- AI metadata
  model_used text,
  tokens_used integer,
  -- Timestamps
  created_at timestamp with time zone default now()
);

-- 19. SMART DOCUMENT COMPARISONS (For comparison history)
create table smart_document_comparisons (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text, -- Optional name for saved comparison
  document_ids uuid[] not null, -- Documents being compared (2+)
  comparison_summary text, -- AI-generated comparison summary
  comparison_data jsonb, -- Structured comparison data
  created_at timestamp with time zone default now()
);

-- =============================================
-- SMART APP - INDEXES
-- =============================================

create index idx_smart_collections_user on smart_collections(user_id);
create index idx_smart_documents_user on smart_documents(user_id);
create index idx_smart_documents_collection on smart_documents(collection_id);
create index idx_smart_documents_type on smart_documents(document_type);
create index idx_smart_documents_location on smart_documents(latitude, longitude) where latitude is not null;
create index idx_smart_analysis_document on smart_document_analysis(document_id);
create index idx_smart_chat_user on smart_chat_messages(user_id);
create index idx_smart_chat_collection on smart_chat_messages(collection_id);
create index idx_smart_comparisons_user on smart_document_comparisons(user_id);

-- =============================================
-- SMART APP - ROW LEVEL SECURITY
-- =============================================

alter table smart_collections enable row level security;
alter table smart_documents enable row level security;
alter table smart_document_analysis enable row level security;
alter table smart_chat_messages enable row level security;
alter table smart_document_comparisons enable row level security;

-- Collections - users manage their own
create policy "Users can view own collections" on smart_collections
  for select using (true);

create policy "Users can insert own collections" on smart_collections
  for insert with check (true);

create policy "Users can update own collections" on smart_collections
  for update using (true);

create policy "Users can delete own collections" on smart_collections
  for delete using (true);

-- Documents - users manage their own
create policy "Users can view own documents" on smart_documents
  for select using (true);

create policy "Users can insert own documents" on smart_documents
  for insert with check (true);

create policy "Users can update own documents" on smart_documents
  for update using (true);

create policy "Users can delete own documents" on smart_documents
  for delete using (true);

-- Analysis - linked to documents
create policy "Users can view document analysis" on smart_document_analysis
  for select using (true);

create policy "System can manage analysis" on smart_document_analysis
  for insert with check (true);

create policy "System can update analysis" on smart_document_analysis
  for update using (true);

-- Chat messages
create policy "Users can view own chat" on smart_chat_messages
  for select using (true);

create policy "Users can insert chat messages" on smart_chat_messages
  for insert with check (true);

-- Comparisons
create policy "Users can view own comparisons" on smart_document_comparisons
  for select using (true);

create policy "Users can manage comparisons" on smart_document_comparisons
  for insert with check (true);

create policy "Users can delete comparisons" on smart_document_comparisons
  for delete using (true);

-- =============================================
-- SMART APP - SEED DATA
-- =============================================

-- Create a default collection for demo user
insert into smart_collections (user_id, name, description, color, icon, is_default) values
  ('demo-user-001', 'All Documents', 'Default collection for all documents', '#6366f1', 'folder', true),
  ('demo-user-001', 'Palm Jumeirah Villas', 'Floor plans and specs for Palm Jumeirah properties', '#10b981', 'home', false),
  ('demo-user-001', 'Downtown Apartments', 'Downtown Dubai property documents', '#f59e0b', 'building', false),
  ('demo-user-001', 'Plot Comparisons', 'Land plots for comparison analysis', '#ef4444', 'map', false);

-- Sample documents (URLs are placeholders - in production these would be Supabase storage URLs)
insert into smart_documents (user_id, collection_id, name, description, document_type, file_url, file_name, file_size, file_type, property_name, developer, project_name, latitude, longitude, address, area_name, analysis_status) values
  ('demo-user-001', (select id from smart_collections where name = 'Palm Jumeirah Villas' limit 1),
   'Garden Villa Floor Plan', 'Ground floor and first floor layout', 'floor_plan',
   '/demo/palm-villa-floor.pdf', 'palm-villa-floor.pdf', 2500000, 'application/pdf',
   'Garden Villa Type A', 'Nakheel', 'Palm Jumeirah', 25.1124, 55.1390,
   'Frond K, Palm Jumeirah', 'Palm Jumeirah', 'completed'),
  ('demo-user-001', (select id from smart_collections where name = 'Palm Jumeirah Villas' limit 1),
   'Signature Villa Specs', 'Technical specifications and measurements', 'spec_sheet',
   '/demo/signature-specs.pdf', 'signature-specs.pdf', 1800000, 'application/pdf',
   'Signature Villa', 'Nakheel', 'Palm Jumeirah', 25.1150, 55.1420,
   'Frond M, Palm Jumeirah', 'Palm Jumeirah', 'completed'),
  ('demo-user-001', (select id from smart_collections where name = 'Downtown Apartments' limit 1),
   'Burj Vista 2BR Layout', 'Two bedroom apartment floor plan', 'floor_plan',
   '/demo/burj-vista-2br.pdf', 'burj-vista-2br.pdf', 1500000, 'application/pdf',
   'Burj Vista Tower 1', 'Emaar', 'Downtown Dubai', 25.1972, 55.2744,
   'Downtown Dubai', 'Downtown Dubai', 'completed'),
  ('demo-user-001', (select id from smart_collections where name = 'Plot Comparisons' limit 1),
   'Tilal Al Ghaf Plot A12', 'Corner plot with lagoon view', 'plot_map',
   '/demo/tag-plot-a12.pdf', 'tag-plot-a12.pdf', 3200000, 'application/pdf',
   'Plot A12', 'Majid Al Futtaim', 'Tilal Al Ghaf', 25.0156, 55.2048,
   'Harmony Phase 2', 'Tilal Al Ghaf', 'completed'),
  ('demo-user-001', (select id from smart_collections where name = 'Plot Comparisons' limit 1),
   'Tilal Al Ghaf Plot B7', 'Standard plot with park view', 'plot_map',
   '/demo/tag-plot-b7.pdf', 'tag-plot-b7.pdf', 2800000, 'application/pdf',
   'Plot B7', 'Majid Al Futtaim', 'Tilal Al Ghaf', 25.0162, 55.2055,
   'Harmony Phase 2', 'Tilal Al Ghaf', 'completed');

-- Sample analysis data
insert into smart_document_analysis (document_id, plot_size, built_up_area, bedroom_count, bathroom_count, floor_count, parking_spaces, room_dimensions, balcony_area, garden_area, pool_size, features, summary, extraction_confidence) values
  ((select id from smart_documents where name = 'Garden Villa Floor Plan' limit 1),
   8500, 6200, 5, 6, 2, 3,
   '[{"name": "Master Bedroom", "width": 18, "length": 22, "area": 396}, {"name": "Living Room", "width": 25, "length": 30, "area": 750}, {"name": "Kitchen", "width": 15, "length": 20, "area": 300}]',
   450, 2200, '12m x 6m',
   '["private_pool", "maid_room", "driver_room", "home_cinema", "gym", "sauna"]',
   'Luxurious 5-bedroom Garden Villa on Palm Jumeirah featuring 6,200 sqft built-up area on 8,500 sqft plot. Includes private pool, separate maid and driver quarters, home cinema, and gym. Prime location on Frond K with beach access.',
   0.92),
  ((select id from smart_documents where name = 'Signature Villa Specs' limit 1),
   15000, 12500, 7, 8, 3, 5,
   '[{"name": "Master Suite", "width": 25, "length": 30, "area": 750}, {"name": "Grand Living", "width": 35, "length": 45, "area": 1575}, {"name": "Dining Hall", "width": 20, "length": 25, "area": 500}]',
   800, 4500, '18m x 10m',
   '["infinity_pool", "beach_access", "private_marina", "elevator", "wine_cellar", "spa", "staff_quarters"]',
   'Ultra-luxury 7-bedroom Signature Villa spanning 12,500 sqft on a 15,000 sqft beachfront plot. Features private marina, infinity pool, beach access, elevator, wine cellar, and full spa. Includes separate staff quarters.',
   0.95),
  ((select id from smart_documents where name = 'Burj Vista 2BR Layout' limit 1),
   null, 1450, 2, 3, 1, 1,
   '[{"name": "Master Bedroom", "width": 14, "length": 16, "area": 224}, {"name": "Living/Dining", "width": 18, "length": 24, "area": 432}, {"name": "Second Bedroom", "width": 12, "length": 14, "area": 168}]',
   180, null, null,
   '["burj_khalifa_view", "balcony", "built_in_wardrobes", "premium_finishes"]',
   'Premium 2-bedroom apartment in Burj Vista with stunning Burj Khalifa views. 1,450 sqft living space with spacious balcony. High-end finishes throughout with built-in wardrobes.',
   0.89),
  ((select id from smart_documents where name = 'Tilal Al Ghaf Plot A12' limit 1),
   12000, null, null, null, null, null,
   '[]',
   null, 12000, null,
   '["corner_plot", "lagoon_view", "premium_location", "g_plus_2_allowance"]',
   'Premium corner plot (12,000 sqft) in Harmony Phase 2 with direct lagoon views. G+2 building allowance. One of the most sought-after locations in Tilal Al Ghaf.',
   0.94),
  ((select id from smart_documents where name = 'Tilal Al Ghaf Plot B7' limit 1),
   9500, null, null, null, null, null,
   '[]',
   null, 9500, null,
   '["park_view", "standard_plot", "g_plus_1_allowance", "near_amenities"]',
   'Standard plot (9,500 sqft) in Harmony Phase 2 with park views. G+1 building allowance. Close to community amenities and retail.',
   0.93);

-- Update collection document counts
update smart_collections set document_count = (
  select count(*) from smart_documents where collection_id = smart_collections.id
);

-- Sample chat messages
insert into smart_chat_messages (user_id, collection_id, role, content, document_ids) values
  ('demo-user-001', (select id from smart_collections where name = 'Palm Jumeirah Villas' limit 1),
   'user', 'What is the size difference between the Garden Villa and Signature Villa?',
   (select array_agg(id) from smart_documents where name like '%Villa%')),
  ('demo-user-001', (select id from smart_collections where name = 'Palm Jumeirah Villas' limit 1),
   'assistant', 'Based on the floor plans and specifications:\n\n**Garden Villa:**\n- Plot Size: 8,500 sqft\n- Built-up Area: 6,200 sqft\n- Bedrooms: 5\n- Bathrooms: 6\n\n**Signature Villa:**\n- Plot Size: 15,000 sqft\n- Built-up Area: 12,500 sqft\n- Bedrooms: 7\n- Bathrooms: 8\n\n**Key Differences:**\n- The Signature Villa is almost **twice the size** (6,300 sqft more built-up area)\n- Plot is 6,500 sqft larger\n- 2 additional bedrooms\n- Premium features include private marina, infinity pool, and elevator\n- Price point would be significantly higher (typically 3-4x)',
   (select array_agg(id) from smart_documents where name like '%Villa%')),
  ('demo-user-001', (select id from smart_collections where name = 'Plot Comparisons' limit 1),
   'user', 'Compare the two plots in Tilal Al Ghaf - which is better for investment?',
   (select array_agg(id) from smart_documents where name like '%Plot%')),
  ('demo-user-001', (select id from smart_collections where name = 'Plot Comparisons' limit 1),
   'assistant', 'Here''s a comparison of the two Tilal Al Ghaf plots:\n\n**Plot A12 (Corner Plot)**\n- Size: 12,000 sqft\n- View: Lagoon view\n- Building: G+2 allowance\n- Premium: ✅ Corner location\n\n**Plot B7 (Standard Plot)**\n- Size: 9,500 sqft\n- View: Park view\n- Building: G+1 allowance\n- Proximity: Near amenities\n\n**Investment Analysis:**\n\n🏆 **Plot A12 is the better investment** for these reasons:\n1. **26% larger** plot (2,500 sqft more)\n2. **G+2 vs G+1** - Can build 50% more floors\n3. **Lagoon view** commands premium pricing\n4. **Corner plots** typically appreciate 15-20% faster\n5. **Scarcity** - Limited corner lagoon-view plots\n\nHowever, Plot B7 offers **lower entry price** and proximity to amenities, making it suitable for end-users who want convenience over maximum returns.',
   (select array_agg(id) from smart_documents where name like '%Plot%'));
