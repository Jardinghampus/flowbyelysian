-- Templates (admin only writes, all authenticated read)
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- 'marketing_leasing' | 'socials_only' | 'general'
  content_json jsonb not null, -- rich text content with variable placeholders
  variables jsonb not null, -- array of {key, label, type}
  updated_by uuid references auth.users,
  updated_at timestamptz default now()
);

-- Documents (one per contract instance)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates,
  agent_id text not null, -- Clerk user ID
  agent_email text not null,
  agent_name text not null,
  status text not null default 'draft', -- draft | sent | signed | expired
  sign_token uuid unique default gen_random_uuid(),
  signer_email text,
  signer_name text,
  created_at timestamptz default now(),
  sent_at timestamptz,
  signed_at timestamptz,
  pdf_url text -- Supabase Storage URL of signed PDF
);

-- Field values filled in by agent
create table if not exists document_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade,
  field_key text not null,
  field_value text not null
);

-- Signature data
create table if not exists signatures (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade,
  image_base64 text not null, -- PNG data URL from canvas
  signed_at timestamptz default now(),
  signer_ip text
);

-- RLS Policies
alter table templates enable row level security;
alter table documents enable row level security;
alter table document_fields enable row level security;
alter table signatures enable row level security;

-- Templates: all authenticated can SELECT
create policy "templates_select_all" on templates
  for select to authenticated using (true);

-- Templates: only admins can INSERT/UPDATE
create policy "templates_insert_admin" on templates
  for insert to authenticated
  with check (
    (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

create policy "templates_update_admin" on templates
  for update to authenticated
  using (
    (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

-- Documents: agents see own, admins see all
create policy "documents_select" on documents
  for select to authenticated
  using (
    agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    or (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

create policy "documents_insert" on documents
  for insert to authenticated
  with check (
    agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
  );

create policy "documents_update" on documents
  for update to authenticated
  using (
    agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    or (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

-- Document fields: inherit from parent document
create policy "document_fields_select" on document_fields
  for select to authenticated
  using (
    exists (
      select 1 from documents d
      where d.id = document_fields.document_id
      and (
        d.agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        or (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
      )
    )
  );

create policy "document_fields_insert" on document_fields
  for insert to authenticated
  with check (
    exists (
      select 1 from documents d
      where d.id = document_fields.document_id
      and d.agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )
  );

-- Signatures: inherit from parent document
create policy "signatures_select" on signatures
  for select to authenticated
  using (
    exists (
      select 1 from documents d
      where d.id = signatures.document_id
      and (
        d.agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
        or (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
      )
    )
  );

-- Allow anonymous signature inserts (for public sign page)
create policy "signatures_insert_anon" on signatures
  for insert to anon
  with check (
    exists (
      select 1 from documents d
      where d.id = signatures.document_id
      and d.status = 'sent'
    )
  );

-- Allow anonymous document select by sign_token (for public sign page)
create policy "documents_select_anon" on documents
  for select to anon
  using (true);

-- Allow anonymous document field select (for public sign page rendering)
create policy "document_fields_select_anon" on document_fields
  for select to anon
  using (true);

-- Allow anonymous document update (for sign flow to update status)
create policy "documents_update_anon" on documents
  for update to anon
  using (status = 'sent');

-- Seed the 3 default templates
insert into templates (name, type, content_json, variables) values
(
  'Marketing & Leasing Agreement',
  'marketing_leasing',
  '"This Marketing & Leasing Agreement (\"Agreement\") is entered into on {{start_date}} between:\n\nAgent: {{agent_name}}\nEmail: {{agent_email}}\n\nClient: {{client_name}}\nEmail: {{client_email}}\n\nProperty: {{property_address}}\n\n1. SCOPE OF SERVICES\nThe Agent agrees to provide comprehensive marketing and leasing services for the above-mentioned property, including but not limited to:\n- Professional photography and virtual tours\n- Listing on major property portals\n- Social media marketing campaigns\n- Property viewings and open houses\n- Tenant screening and selection\n- Lease negotiation and documentation\n\n2. COMMISSION\nThe Client agrees to pay the Agent a commission of {{commission_rate}} of the annual rent upon successful leasing of the property.\n\n3. TERM\nThis Agreement shall commence on {{start_date}} and remain in effect until {{end_date}}, unless terminated earlier by either party with 30 days written notice.\n\n4. EXCLUSIVITY\nDuring the term of this Agreement, the Client grants the Agent exclusive rights to market and lease the property.\n\n5. GOVERNING LAW\nThis Agreement shall be governed by the laws of the United Arab Emirates and the Emirate of Dubai.\n\nSigned by:\n\nAgent: {{agent_name}}\nDate: {{start_date}}\n\nClient: {{client_name}}\nDate: _______________\nSignature: _______________"',
  '[{"key": "client_name", "label": "Client Full Name", "type": "text"}, {"key": "client_email", "label": "Client Email", "type": "email"}, {"key": "property_address", "label": "Property Address", "type": "text"}, {"key": "commission_rate", "label": "Commission Rate", "type": "text"}, {"key": "start_date", "label": "Start Date", "type": "date"}, {"key": "end_date", "label": "End Date", "type": "date"}, {"key": "agent_name", "label": "Agent Name", "type": "text"}, {"key": "agent_email", "label": "Agent Email", "type": "email"}]'
),
(
  'Marketing & Leasing — Socials Only',
  'socials_only',
  '"This Social Media Marketing Agreement (\"Agreement\") is entered into on {{start_date}} between:\n\nAgent: {{agent_name}}\nEmail: {{agent_email}}\n\nClient: {{client_name}}\nEmail: {{client_email}}\n\nProperty: {{property_address}}\n\n1. SCOPE OF SERVICES\nThe Agent agrees to provide social media marketing services for the above-mentioned property, including:\n- Instagram and Facebook property posts\n- Story highlights and reels\n- Targeted social media advertising\n- Monthly performance reports\n\n2. SERVICE FEE\nThe Client agrees to pay a monthly fee of {{monthly_fee}} for the duration of this Agreement.\n\n3. TERM\nThis Agreement shall commence on {{start_date}} and remain in effect until {{end_date}}.\n\n4. CONTENT RIGHTS\nThe Client grants the Agent permission to use property photos and descriptions for social media marketing purposes.\n\n5. GOVERNING LAW\nThis Agreement shall be governed by the laws of the United Arab Emirates and the Emirate of Dubai.\n\nSigned by:\n\nAgent: {{agent_name}}\nDate: {{start_date}}\n\nClient: {{client_name}}\nDate: _______________\nSignature: _______________"',
  '[{"key": "client_name", "label": "Client Full Name", "type": "text"}, {"key": "client_email", "label": "Client Email", "type": "email"}, {"key": "property_address", "label": "Property Address", "type": "text"}, {"key": "monthly_fee", "label": "Monthly Fee (AED)", "type": "text"}, {"key": "start_date", "label": "Start Date", "type": "date"}, {"key": "end_date", "label": "End Date", "type": "date"}, {"key": "agent_name", "label": "Agent Name", "type": "text"}, {"key": "agent_email", "label": "Agent Email", "type": "email"}]'
),
(
  'General Agreement',
  'general',
  '"This General Agreement (\"Agreement\") is entered into on {{start_date}} between:\n\nAgent: {{agent_name}}\nEmail: {{agent_email}}\n\nClient: {{client_name}}\nEmail: {{client_email}}\n\nRe: {{subject}}\n\n1. PURPOSE\n{{agreement_details}}\n\n2. COMPENSATION\nThe Client agrees to pay {{compensation}} as outlined in this Agreement.\n\n3. TERM\nThis Agreement shall commence on {{start_date}} and remain in effect until {{end_date}}.\n\n4. CONFIDENTIALITY\nBoth parties agree to maintain the confidentiality of all terms and conditions outlined in this Agreement.\n\n5. GOVERNING LAW\nThis Agreement shall be governed by the laws of the United Arab Emirates and the Emirate of Dubai.\n\nSigned by:\n\nAgent: {{agent_name}}\nDate: {{start_date}}\n\nClient: {{client_name}}\nDate: _______________\nSignature: _______________"',
  '[{"key": "client_name", "label": "Client Full Name", "type": "text"}, {"key": "client_email", "label": "Client Email", "type": "email"}, {"key": "subject", "label": "Agreement Subject", "type": "text"}, {"key": "agreement_details", "label": "Agreement Details", "type": "text"}, {"key": "compensation", "label": "Compensation", "type": "text"}, {"key": "start_date", "label": "Start Date", "type": "date"}, {"key": "end_date", "label": "End Date", "type": "date"}, {"key": "agent_name", "label": "Agent Name", "type": "text"}, {"key": "agent_email", "label": "Agent Email", "type": "email"}]'
)
on conflict do nothing;
