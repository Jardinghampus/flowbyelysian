-- Document settings (singleton row for header/branding config)
create table if not exists document_settings (
  id uuid primary key default gen_random_uuid(),
  header_logo_url text,           -- Supabase Storage path for logo image
  company_name text,
  company_phone text,
  company_email text,
  company_website text,
  company_address text,
  updated_at timestamptz default now()
);

-- RLS
alter table document_settings enable row level security;

-- All authenticated can read
create policy "document_settings_select" on document_settings
  for select to authenticated using (true);

-- Admins can insert/update
create policy "document_settings_insert_admin" on document_settings
  for insert to authenticated
  with check (
    (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

create policy "document_settings_update_admin" on document_settings
  for update to authenticated
  using (
    (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

-- Anon can read (for public sign page PDF generation)
create policy "document_settings_select_anon" on document_settings
  for select to anon using (true);

-- Seed default row with Derrick Signature Properties info
insert into document_settings (company_name, company_phone, company_email, company_website, company_address)
values (
  'DERRICK SIGNATURE PROPERTIES L.L.C',
  '+ 971 (0) 4 295 5397',
  'info@derricksignatureproperties.ae',
  'www.derricksignatureproperties.ae',
  'Office 605, Al Barsha Business Square, Dubai, UAE'
);
