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
