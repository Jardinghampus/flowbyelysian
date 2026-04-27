import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"

// GET /api/performance
// Returns leaderboard, achievements (with user progress), monthly KPI history, and targets
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const supabase = createServerClient()

    // ── 1. Leaderboard ──────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lbData } = await (supabase as any)
      .from("leaderboard_points")
      .select("*")
      .order("monthly_points", { ascending: false })
      .limit(10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: contactsData } = await (supabase as any)
      .from("contacts")
      .select("clerk_user_id, name")

    const contactMap = new Map<string, string>(
      (contactsData || []).map((c: { clerk_user_id: string; name: string }) => [c.clerk_user_id, c.name])
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leaderboard = (lbData || []).map((row: any, index: number) => ({
      agentId: row.agent_id,
      name: contactMap.get(row.agent_id) || "Agent",
      rank: index + 1,
      points: row.points ?? 0,
      monthlyPoints: row.monthly_points ?? 0,
      weeklyPoints: row.weekly_points ?? 0,
      yearlyPoints: row.yearly_points ?? 0,
      streakDays: row.streak_days ?? 0,
    }))

    // ── 2. Achievements with user progress ──────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: achievementsData } = await (supabase as any)
      .from("achievements")
      .select("*")
      .order("category")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userAchievements } = await (supabase as any)
      .from("agent_achievements")
      .select("achievement_id, unlocked_at, progress, max_progress")
      .eq("agent_id", userId)

    const userAchMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (userAchievements || []).map((aa: any) => [aa.achievement_id, aa])
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const achievements = (achievementsData || []).map((ach: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRecord = userAchMap.get(ach.id) as any
      return {
        id: ach.id,
        name: ach.name,
        description: ach.description,
        category: ach.category,
        rarity: ach.rarity,
        icon: ach.icon,
        unlocked: !!userRecord?.unlocked_at,
        progress: userRecord?.progress ?? null,
        maxProgress: userRecord?.max_progress ?? null,
        unlockedAt: userRecord?.unlocked_at ?? null,
      }
    })

    // ── 3. Agent targets ────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetsData } = await (supabase as any)
      .from("agent_targets")
      .select("*")
      .eq("agent_id", userId)
      .maybeSingle()

    const targets = targetsData
      ? {
          dealsTarget: targetsData.deals_target,
          commissionTarget: targetsData.commission_target,
          listingsTarget: targetsData.listings_target,
          viewingsTarget: targetsData.viewings_target,
        }
      : null

    // ── 4. Monthly KPI history (last 12 months) ─────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kpiData } = await (supabase as any)
      .from("monthly_kpi_history")
      .select("year, month, deals_closed, commission_earned, viewings_conducted, listings_created")
      .eq("agent_id", userId)
      .order("year", { ascending: true })
      .order("month", { ascending: true })
      .limit(12)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthlyKPI = (kpiData || []).map((row: any) => ({
      year: row.year,
      month: row.month,
      dealsClosed: row.deals_closed ?? 0,
      commissionEarned: row.commission_earned ?? 0,
      viewingsConducted: row.viewings_conducted ?? 0,
      listingsCreated: row.listings_created ?? 0,
    }))

    // ── 5. Current month actuals (for target progress) ──────────────────────
    const now = new Date()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentKPI } = await (supabase as any)
      .from("monthly_kpi_history")
      .select("deals_closed, commission_earned, listings_created, viewings_conducted")
      .eq("agent_id", userId)
      .eq("year", now.getFullYear())
      .eq("month", now.getMonth() + 1)
      .maybeSingle()

    const currentMonth = currentKPI
      ? {
          dealsClosed: currentKPI.deals_closed ?? 0,
          commissionEarned: currentKPI.commission_earned ?? 0,
          listingsCreated: currentKPI.listings_created ?? 0,
          viewingsConducted: currentKPI.viewings_conducted ?? 0,
        }
      : null

    return NextResponse.json({
      leaderboard,
      achievements,
      targets,
      currentMonth,
      monthlyKPI,
    })
  } catch (error) {
    console.error("Error fetching performance data:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }
}

// PATCH /api/performance – update agent targets
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    const body = await request.json()
    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("agent_targets")
      .upsert(
        {
          agent_id: userId,
          deals_target: body.dealsTarget,
          commission_target: body.commissionTarget,
          listings_target: body.listingsTarget,
          viewings_target: body.viewingsTarget,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "agent_id" }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      targets: {
        dealsTarget: data.deals_target,
        commissionTarget: data.commission_target,
        listingsTarget: data.listings_target,
        viewingsTarget: data.viewings_target,
      },
    })
  } catch (error) {
    console.error("Error updating targets:", error)
    return NextResponse.json({ error: "Failed to update targets" }, { status: 500 })
  }
}
