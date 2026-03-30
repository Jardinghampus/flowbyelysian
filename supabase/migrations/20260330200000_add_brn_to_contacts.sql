-- Add BRN (Broker Registration Number) column to contacts table
alter table contacts add column if not exists brn text;
