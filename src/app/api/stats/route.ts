import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()
    const threeDaysOut = new Date(Date.now() + 3 * 86400000).toISOString()

    const [
      listingsRes,
      leadsRes,
      ownersRes,
      activityRes,
      notifRes,
      overdueRes,
      dueTodayRes,
      dueSoonRes,
      recentOutreachRes,
    ] = await Promise.all([
      (supabase as ReturnType<typeof createServerClient>)
        .from("listings")
        .select("status", { count: "exact" }),
      (supabase as ReturnType<typeof createServerClient>)
        .from("opportunities")
        .select("status", { count: "exact" }),
      (supabase as ReturnType<typeof createServerClient>)
        .from("owners")
        .select("status, follow_up_at, is_hidden", { count: "exact" })
        .eq("is_hidden", false),
      (supabase as ReturnType<typeof createServerClient>)
        .from("daily_activity_log")
        .select("agent_id, calls_wa, leads, viewings")
        .eq("activity_date", today),
      (supabase as ReturnType<typeof createServerClient>)
        .from("notifications")
        .select("read", { count: "exact" })
        .eq("read", false),
      // Overdue follow-ups
      (supabase as ReturnType<typeof createServerClient>)
        .from("owners")
        .select("id, name, phone, area, follow_up_at, priority, status")
        .eq("is_hidden", false)
        .lt("follow_up_at", now)
        .not("follow_up_at", "is", null)
        .order("follow_up_at", { ascending: true })
        .limit(20),
      // Due today
      (supabase as ReturnType<typeof createServerClient>)
        .from("owners")
        .select("id, name, phone, area, follow_up_at, priority, status")
        .eq("is_hidden", false)
        .gte("follow_up_at", today)
        .lt("follow_up_at", today + "T23:59:59.999Z")
        .order("follow_up_at", { ascending: true })
        .limit(20),
      // Due within 3 days
      (supabase as ReturnType<typeof createServerClient>)
        .from("owners")
        .select("id, name, phone, area, follow_up_at, priority, status")
        .eq("is_hidden", false)
        .gte("follow_up_at", today + "T23:59:59.999Z")
        .lte("follow_up_at", threeDaysOut)
        .order("follow_up_at", { ascending: true })
        .limit(20),
      // Recent outreach across all owners
      (supabase as ReturnType<typeof createServerClient>)
        .from("outreach_logs")
        .select("id, type, outcome, agent_name, logged_at, status_changed_to, owner_id")
        .order("logged_at", { ascending: false })
        .limit(15),
    ])

    const listings = (listingsRes.data || []) as Array<{ status: string }>
    const leads = (leadsRes.data || []) as Array<{ status: string }>
    const owners = (ownersRes.data || []) as Array<{ status: string; follow_up_at: string | null }>
    const activity = (activityRes.data || []) as Array<{ agent_id: string; calls_wa: number; leads: number; viewings: number }>

    const overdueFollowUps = owners.filter(
      (o) => o.follow_up_at && o.follow_up_at < now
    ).length

    const activityTotals = activity.reduce(
      (acc, d) => ({
        calls: acc.calls + (d.calls_wa || 0),
        leads: acc.leads + (d.leads || 0),
        viewings: acc.viewings + (d.viewings || 0),
      }),
      { calls: 0, leads: 0, viewings: 0 }
    )

    const uniqueAgentsToday = new Set(
      activity.filter((d) => (d.calls_wa || 0) + (d.leads || 0) + (d.viewings || 0) > 0).map((d) => d.agent_id)
    )

    const unassignedCount = leads.filter((l) => l.status === "new").length

    // Enrich recent outreach with owner names
    const outreachOwnerIds = [...new Set((recentOutreachRes.data || []).map((o: { owner_id: string }) => o.owner_id))]
    let ownerNameMap: Record<string, string> = {}
    if (outreachOwnerIds.length > 0) {
      const { data: ownerNames } = await (supabase as ReturnType<typeof createServerClient>)
        .from("owners")
        .select("id, name")
        .in("id", outreachOwnerIds)
      if (ownerNames) {
        ownerNameMap = Object.fromEntries(ownerNames.map((o: { id: string; name: string }) => [o.id, o.name]))
      }
    }

    const recentOutreach = (recentOutreachRes.data || []).map((log: Record<string, unknown>) => ({
      ...log,
      owner_name: ownerNameMap[log.owner_id as string] || "Unknown",
    }))

    return NextResponse.json({
      listings: {
        total: listingsRes.count || 0,
        live: listings.filter((l) => l.status === "live").length,
        pocket: listings.filter((l) => l.status === "pocket").length,
        unofficial: listings.filter((l) => l.status === "unofficial").length,
      },
      leads: {
        total: leadsRes.count || 0,
        new: leads.filter((l) => l.status === "new").length,
        contacted: leads.filter((l) => l.status === "contacted").length,
        inProgress: leads.filter((l) => l.status === "in_progress").length,
        matched: leads.filter((l) => l.status === "matched").length,
      },
      owners: {
        total: ownersRes.count || 0,
        considering: owners.filter((o) => o.status === "considering").length,
        listed: owners.filter((o) => o.status === "listed").length,
        overdueFollowUps,
      },
      activity: {
        callsToday: activityTotals.calls,
        leadsToday: activityTotals.leads,
        viewingsToday: activityTotals.viewings,
      },
      agents: {
        total: activity.length,
        activeToday: uniqueAgentsToday.size,
      },
      pipeline: {
        stale: leads.filter((l) => l.status === "new" || l.status === "contacted").length,
        unassigned: unassignedCount,
        total: leadsRes.count || 0,
      },
      unreadNotifications: notifRes.count || 0,
      followUps: {
        overdue: overdueRes.data || [],
        dueToday: dueTodayRes.data || [],
        dueSoon: dueSoonRes.data || [],
      },
      recentOutreach,
    })
  } catch (error) {
    console.error("Error fetching unified stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
