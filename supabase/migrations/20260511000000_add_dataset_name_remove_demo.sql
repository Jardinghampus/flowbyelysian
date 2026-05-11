-- Add dataset_name to owners so imports can be labelled and access-controlled
ALTER TABLE owners ADD COLUMN IF NOT EXISTS dataset_name text;

-- Remove demo seed data
DELETE FROM outreach_logs WHERE agent_id = 'demo-user-001';
DELETE FROM owners WHERE user_id = 'demo-user-001';
