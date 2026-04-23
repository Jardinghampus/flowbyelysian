"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Copy, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

const MIGRATION_SQL = `-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp_number text GENERATED ALWAYS AS (regexp_replace(phone, '[^0-9]', '', 'g')) STORED,
  area text NOT NULL,
  unit_number text,
  bedrooms text,
  status text CHECK (status IN ('owner','considering','listed','sold','unresponsive')) DEFAULT 'owner',
  priority text CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
  last_contacted_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  assigned_agent_id text NOT NULL,
  assigned_agent_name text,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  agent_name text,
  type text CHECK (type IN ('call','whatsapp','email','meeting','sms')) NOT NULL,
  outcome text,
  status_changed_to text,
  follow_up_set_to timestamptz,
  logged_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owners_user_id ON owners(user_id);
CREATE INDEX IF NOT EXISTS idx_owners_area ON owners(user_id, area);
CREATE INDEX IF NOT EXISTS idx_owners_assigned_agent ON owners(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_owners_follow_up ON owners(follow_up_at);
CREATE INDEX IF NOT EXISTS idx_owners_status ON owners(status);
CREATE INDEX IF NOT EXISTS idx_owners_last_contacted ON owners(last_contacted_at);
CREATE INDEX IF NOT EXISTS idx_owners_hidden ON owners(is_hidden);
CREATE INDEX IF NOT EXISTS idx_outreach_owner ON outreach_logs(owner_id);
CREATE INDEX IF NOT EXISTS idx_outreach_agent ON outreach_logs(agent_id, logged_at);

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners are viewable by authenticated users" ON owners FOR SELECT USING (true);
CREATE POLICY "Users can insert owners" ON owners FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update owners" ON owners FOR UPDATE USING (true);
CREATE POLICY "Users can delete owners" ON owners FOR DELETE USING (true);

CREATE POLICY "Outreach logs are viewable by authenticated users" ON outreach_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert outreach logs" ON outreach_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update outreach logs" ON outreach_logs FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION update_owner_last_contacted()
RETURNS trigger AS $$
BEGIN
  UPDATE owners
  SET last_contacted_at = NEW.logged_at, updated_at = now()
  WHERE id = NEW.owner_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_outreach_update_last_contacted ON outreach_logs;
CREATE TRIGGER trg_outreach_update_last_contacted
  AFTER INSERT ON outreach_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_owner_last_contacted();

CREATE OR REPLACE VIEW owners_with_counts AS
SELECT o.*,
  coalesce(counts.call_count, 0) AS call_count,
  coalesce(counts.whatsapp_count, 0) AS whatsapp_count,
  coalesce(counts.total_outreach, 0) AS total_outreach
FROM owners o
LEFT JOIN LATERAL (
  SELECT
    count(*) FILTER (WHERE type = 'call') AS call_count,
    count(*) FILTER (WHERE type = 'whatsapp') AS whatsapp_count,
    count(*) AS total_outreach
  FROM outreach_logs WHERE owner_id = o.id
) counts ON true;

CREATE OR REPLACE VIEW owners_active AS
SELECT * FROM owners_with_counts WHERE is_hidden = false;`

export function DatabaseSetup() {
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading")
  const [tables, setTables] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch("/api/migrate")
      .then((r) => r.json())
      .then((data) => {
        setTables(data.tables || {})
        setStatus(data.ready ? "ready" : "missing")
      })
      .catch(() => setStatus("missing"))
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(MIGRATION_SQL)
    toast.success("SQL copied to clipboard")
  }

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Checking database tables...</span>
        </CardContent>
      </Card>
    )
  }

  if (status === "ready") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Database ready — owners and outreach_logs tables exist
          </span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <AlertCircle className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
        <CardDescription>
          The following tables are missing. Run the SQL below in your{" "}
          <strong>Supabase Dashboard → SQL Editor</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 text-sm">
          {Object.entries(tables).map(([table, exists]) => (
            <div key={table} className="flex items-center gap-1.5">
              {exists ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <code className="text-xs">{table}</code>
            </div>
          ))}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 z-10 gap-1.5"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy SQL
          </Button>
          <pre className="rounded-lg bg-neutral-950 text-neutral-300 text-xs p-4 pt-12 max-h-[300px] overflow-auto font-mono leading-relaxed">
            {MIGRATION_SQL}
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          After running the SQL, refresh this page to verify the tables were created.
        </p>
      </CardContent>
    </Card>
  )
}
