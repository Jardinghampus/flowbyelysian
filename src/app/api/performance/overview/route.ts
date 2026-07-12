import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import { buildPerformanceOverview, currentPeriod } from "@/lib/performance/aggregate"

export async function GET(request: NextRequest) {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const now = currentPeriod()
  const year = Number(searchParams.get("year") || now.year)
  const month = Number(searchParams.get("month") || now.month)

  if (!Number.isInteger(year) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 })
  }

  try {
    const supabase = createUntypedServerClient()
    const overview = await buildPerformanceOverview(supabase, { year, month })

    // Agents only see their row in detail, but company totals stay visible
    if (guard.context.role === "agent") {
      return NextResponse.json({
        ...overview,
        agents: overview.agents.filter((a) => a.agentId === guard.context.userId),
        allAgentCount: overview.agents.length,
      })
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error("performance overview", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load performance" },
      { status: 500 }
    )
  }
}
