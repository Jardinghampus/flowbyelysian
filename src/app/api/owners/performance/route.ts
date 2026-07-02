import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { fetchAgentPerformance } from "@/app/app/data/_lib/supabase-queries"

export async function GET(request: NextRequest) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId") || undefined
    const performance = await fetchAgentPerformance(agentId)
    return NextResponse.json(performance)
  } catch (error) {
    console.error("Error fetching performance:", error)
    return NextResponse.json({ error: "Failed to fetch performance" }, { status: 500 })
  }
}
