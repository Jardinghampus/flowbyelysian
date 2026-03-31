-- Add delete policy for documents (agents delete own, admins delete all)
create policy "documents_delete" on documents
  for delete to authenticated
  using (
    agent_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    or (current_setting('request.jwt.claims', true)::jsonb -> 'metadata' ->> 'role') = 'admin'
  );

-- Add auto_delete_months column to document_settings
alter table document_settings
  add column if not exists auto_delete_months integer;

-- Add comment for clarity
comment on column document_settings.auto_delete_months is 'Number of months after which signed documents are auto-deleted. NULL means disabled. Valid values: 3, 6, 9, 12.';
