import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { buildLiveBoard } from "@/lib/kpi/aggregate"
import type { KpiPeriodKey } from "@/lib/kpi/periods"

const PERIODS = new Set<KpiPeriodKey>(["week", "30d", "60d", "90d", "ytd"])

/** Full team board for office TV — all agents see all rows. */
export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const period = (new URL(request.url).searchParams.get("period") || "week") as KpiPeriodKey
  if (!PERIODS.has(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 })
  }

  try {
    const supabase = createUntypedServerClient()
    const board = await buildLiveBoard(supabase, period)
    return NextResponse.json(board)
  } catch (error) {
    console.error("live board", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load live board" },
      { status: 500 }
    )
  }
}
