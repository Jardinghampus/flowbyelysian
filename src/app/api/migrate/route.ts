import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const guard = await requireApiUser({ roles: ["admin"] })
    if (!guard.ok) return guard.response

    const supabase = createServerClient()

    const tables: Record<string, boolean> = {}

    const { error: ownersErr } = await supabase.from("owners").select("id").limit(0)
    tables.owners = !ownersErr

    const { error: logsErr } = await supabase.from("outreach_logs").select("id").limit(0)
    tables.outreach_logs = !logsErr

    const allReady = Object.values(tables).every(Boolean)

    return NextResponse.json({ ready: allReady, tables })
  } catch (err) {
    return NextResponse.json({ ready: false, error: String(err) })
  }
}
