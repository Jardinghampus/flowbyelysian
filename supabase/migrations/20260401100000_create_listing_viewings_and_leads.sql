-- Listing Viewings: track property viewings per listing
create table listing_viewings (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade not null,
  viewer_name text not null,
  viewer_email text,
  viewer_phone text,
  viewing_date timestamp with time zone not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback text, -- viewer feedback / agent comment about the viewing
  rating integer check (rating >= 1 and rating <= 5), -- interest level 1-5
  agent_id text, -- clerk user id of agent who conducted
  agent_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_listing_viewings_listing on listing_viewings(listing_id);
create index idx_listing_viewings_agent on listing_viewings(agent_id);
create index idx_listing_viewings_date on listing_viewings(viewing_date);

-- Listing Leads: track interested parties / inquiries per listing
create table listing_leads (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade not null,
  lead_name text not null,
  lead_email text,
  lead_phone text,
  lead_whatsapp text,
  source text default 'direct' check (source in ('direct', 'property_finder', 'bayut', 'dubizzle', 'website', 'referral', 'social_media', 'walk_in', 'other')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'viewing_scheduled', 'offer_made', 'negotiating', 'closed_won', 'closed_lost')),
  budget numeric,
  notes text,
  agent_id text, -- clerk user id of assigned agent
  agent_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_listing_leads_listing on listing_leads(listing_id);
create index idx_listing_leads_agent on listing_leads(agent_id);
create index idx_listing_leads_status on listing_leads(status);

-- Landlord Report snapshots: store generated report data for history
create table landlord_reports (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade not null,
  agent_id text not null, -- clerk user id of agent who generated
  agent_name text,
  -- Report content (editable before download)
  report_title text,
  pricing_notes text,
  market_summary text,
  agent_notes text,
  recommendations text,
  -- Snapshot data at time of generation
  total_leads integer default 0,
  total_viewings integer default 0,
  total_inquiries integer default 0,
  avg_interest_rating numeric,
  days_on_market integer default 0,
  created_at timestamp with time zone default now()
);

create index idx_landlord_reports_listing on landlord_reports(listing_id);
create index idx_landlord_reports_agent on landlord_reports(agent_id);

-- RLS policies (permissive for demo)
alter table listing_viewings enable row level security;
alter table listing_leads enable row level security;
alter table landlord_reports enable row level security;

create policy "Allow all for listing_viewings" on listing_viewings for all using (true) with check (true);
create policy "Allow all for listing_leads" on listing_leads for all using (true) with check (true);
create policy "Allow all for landlord_reports" on landlord_reports for all using (true) with check (true);
