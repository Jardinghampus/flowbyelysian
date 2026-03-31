-- Add header_display_name column for sidebar/app header text
alter table document_settings
  add column if not exists header_display_name text default 'ZFLOW';

-- Set default for existing rows
update document_settings
  set header_display_name = 'ZFLOW'
  where header_display_name is null;
