-- Add google_maps_url column to listings table
alter table listings add column if not exists google_maps_url text;
