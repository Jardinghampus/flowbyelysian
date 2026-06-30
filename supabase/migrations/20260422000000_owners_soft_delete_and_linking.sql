-- =============================================
-- Soft delete, owner-listing linking, unified contact model
-- =============================================

-- 1. Soft delete: agents archive, only admins permanently delete
ALTER TABLE owners ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_owners_hidden ON owners(is_hidden);

-- 2. Link owners ↔ listings (unified contact model)
-- An owner contact can be linked to one or more listings they own
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_contact_id uuid REFERENCES owners(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_listings_owner_contact ON listings(owner_contact_id);

-- 3. Link owners ↔ opportunities (same person as buyer/seller/tenant)
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS owner_contact_id uuid REFERENCES owners(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_contact ON opportunities(owner_contact_id);

-- 4. Update the view to exclude hidden by default
CREATE OR REPLACE VIEW owners_with_counts AS
SELECT
  o.*,
  coalesce(counts.call_count, 0) AS call_count,
  coalesce(counts.whatsapp_count, 0) AS whatsapp_count,
  coalesce(counts.total_outreach, 0) AS total_outreach
FROM owners o
LEFT JOIN LATERAL (
  SELECT
    count(*) FILTER (WHERE type = 'call') AS call_count,
    count(*) FILTER (WHERE type = 'whatsapp') AS whatsapp_count,
    count(*) AS total_outreach
  FROM outreach_logs
  WHERE owner_id = o.id
) counts ON true;

-- 5. View for active (non-hidden) owners only — used by agent queries
CREATE OR REPLACE VIEW owners_active AS
SELECT * FROM owners_with_counts WHERE is_hidden = false;
