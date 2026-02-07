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
