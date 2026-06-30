-- Migration: Add sub_area column to listings table
-- Run this in Supabase SQL Editor

alter table listings add column if not exists sub_area text;

create index if not exists idx_listings_sub_area on listings(sub_area) where sub_area is not null;
