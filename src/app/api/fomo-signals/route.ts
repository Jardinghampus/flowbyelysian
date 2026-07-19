import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"

export async function GET() {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const supabase = createUntypedServerClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const today = new Date().toISOString().split("T")[0]

  const [
    { count: descriptions },
    { count: deals },
    { data: toolEvents },
    { count: pipelineTotal },
    { data: activityToday },
  ] = await Promise.all([
    supabase
      .from("team_feed_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "tool_description")
      .gte("created_at", weekAgo),
    supabase
      .from("team_feed_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "tool_deal")
      .gte("created_at", weekAgo),
    supabase
      .from("team_feed_events")
      .select("event_type, title, area_name, actor_name, created_at")
      .like("event_type", "tool_%")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("opportunities").select("*", { count: "exact", head: true }),
    supabase
      .from("daily_activity_log")
      .select("agent_id")
      .eq("activity_date", today),
  ])

  const activeAgents = new Set((activityToday || []).map((row) => row.agent_id)).size

  return NextResponse.json({
    descriptionsThisWeek: descriptions ?? 0,
    dealsThisWeek: deals ?? 0,
    pipelineTotal: pipelineTotal ?? 0,
    activeAgents,
    trainingProgress: { done: 2, total: 8 },
    recentToolActivity: toolEvents ?? [],
  })
}
