import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { getAgentProfileByUserId } from "@/lib/user-profile"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import {
  FOCUS_COMMUNITIES,
  MONTHLY_POST_SCHEDULE,
  buildCaption,
  conceptLabel,
  type BuiltSocialPost,
  type FocusCommunity,
  type PostConcept,
  type SocialPostMetrics,
  postsPerCommunityThisMonth,
  SOCIAL_POST_IDEAS,
} from "@/lib/zaylo/social-focus"

type TxLite = {
  community: string | null
  master_community: string | null
  sub_area: string | null
  property_type: string | null
  transaction_type: string | null
  price_aed: number | null
  price_per_sqft_aed: number | null
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function median(nums: number[]): number | null {
  if (!nums.length) return null
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? Math.round((s[m - 1]! + s[m]!) / 2) : s[m]!
}

function matchesFocus(row: TxLite, focus: FocusCommunity): boolean {
  const c = (row.community || "").toLowerCase()
  const m = (row.master_community || "").toLowerCase()
  return focus.communities.some((name) => {
    const n = name.toLowerCase()
    return c === n || m === n || c.includes(n) || m.includes(n) || n.includes(c)
  })
}

function isVillaTownhouse(row: TxLite): boolean {
  const t = (row.property_type || "").toLowerCase()
  return t.includes("villa") || t.includes("townhouse") || t.includes("town house")
}

function pickTopSubArea(rows: TxLite[]): string | null {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const sub = row.sub_area?.trim()
    if (!sub) continue
    counts.set(sub, (counts.get(sub) || 0) + 1)
  }
  let best: string | null = null
  let bestN = 0
  for (const [sub, n] of counts) {
    if (n > bestN) {
      best = sub
      bestN = n
    }
  }
  return best
}

function computeMetrics(focus: FocusCommunity, all: TxLite[], forceSubArea?: string | null): SocialPostMetrics {
  let rows = all.filter((r) => matchesFocus(r, focus) && isVillaTownhouse(r))
  if (!rows.length) {
    rows = all.filter((r) => matchesFocus(r, focus))
  }

  const subArea =
    forceSubArea ||
    (rows.length ? pickTopSubArea(rows) : null)

  const scoped = subArea ? rows.filter((r) => r.sub_area === subArea) : rows
  const useRows = scoped.length >= 3 ? scoped : rows

  const rents = useRows
    .filter((r) => r.transaction_type === "rent")
    .map((r) => Number(r.price_aed))
    .filter((n) => n > 0)
  const sales = useRows
    .filter((r) => r.transaction_type === "sale")
    .map((r) => Number(r.price_aed))
    .filter((n) => n > 0)
  const pps = useRows.map((r) => Number(r.price_per_sqft_aed)).filter((n) => n > 0)

  const types = new Map<string, number>()
  for (const r of useRows) {
    const t = r.property_type || "Property"
    types.set(t, (types.get(t) || 0) + 1)
  }
  const propertyTypeHint =
    [...types.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || focus.propertyTypes.join(" / ")

  return {
    community: focus.label,
    subArea: useRows === scoped ? subArea : null,
    rentAvg: avg(rents),
    saleAvg: avg(sales),
    rentMedian: median(rents),
    saleMedian: median(sales),
    rentCount: rents.length,
    saleCount: sales.length,
    avgPricePerSqft: avg(pps),
    propertyTypeHint,
  }
}

function buildPost(
  focus: FocusCommunity,
  concept: PostConcept,
  metrics: SocialPostMetrics,
  agent: { fullName: string; phone: string },
  scheduleDay: number | null,
  scheduleLabel: string
): BuiltSocialPost {
  const copy = buildCaption(concept, focus, metrics, agent)
  const samples = metrics.rentCount + metrics.saleCount
  return {
    id: `${focus.id}-${concept}-${scheduleDay ?? "adhoc"}-${metrics.subArea || "all"}`,
    communityId: focus.id,
    communityLabel: focus.label,
    concept,
    scheduleDay,
    scheduleLabel,
    hook: copy.hook,
    headline: copy.headline,
    rentLabel: metrics.rentAvg != null || metrics.rentMedian != null
      ? `${metrics.rentCount} rent txs`
      : "No rent txs",
    saleLabel: metrics.saleAvg != null || metrics.saleMedian != null
      ? `${metrics.saleCount} sale txs`
      : "No sale txs",
    trustLine: copy.trustLine,
    caption: copy.caption,
    hashtags: copy.hashtags,
    metrics,
    status: samples > 0 ? "ready" : "needs_data",
  }
}

export async function GET() {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const profile = await getAgentProfileByUserId(guard.context.userId)
    const agent = {
      fullName: profile?.fullName || guard.context.fullName || "Hampus",
      phone: profile?.phone || "",
      profileImageUrl: profile?.profileImageUrl || null,
      jobTitle: profile?.jobTitle || "Villa & Townhouse Specialist",
      company: profile?.company || "Derrick Signature Properties LLC",
      website: profile?.website || "derricksignatureproperties.ae",
    }

    const supabase = createUntypedServerClient()
    const { data, error } = await supabase
      .from("bayut_transactions")
      .select("community, master_community, sub_area, property_type, transaction_type, price_aed, price_per_sqft_aed")
      .order("transaction_date", { ascending: false })
      .limit(4000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data || []) as TxLite[]
    const today = new Date().getDate()

    const scheduled: BuiltSocialPost[] = MONTHLY_POST_SCHEDULE.map((slot) => {
      const focus = FOCUS_COMMUNITIES.find((c) => c.id === slot.communityId)!
      const forceSub =
        slot.concept === "sub_area_deep_dive" ? pickTopSubArea(rows.filter((r) => matchesFocus(r, focus))) : null
      const metrics = computeMetrics(focus, rows, forceSub)
      return buildPost(focus, slot.concept, metrics, agent, slot.day, slot.label)
    })

    const communityCards = FOCUS_COMMUNITIES.map((focus) => {
      const metrics = computeMetrics(focus, rows)
      return {
        focus,
        metrics,
        post: buildPost(focus, "market_pulse", metrics, agent, null, `${focus.label} anytime pulse`),
      }
    })

    const todays = scheduled.filter((p) => p.scheduleDay === today)
    const upcoming = scheduled.filter((p) => (p.scheduleDay ?? 0) >= today).slice(0, 5)

    return NextResponse.json({
      agent,
      schedule: scheduled,
      communityCards,
      today: todays,
      upcoming,
      postsPerCommunity: postsPerCommunityThisMonth(),
      ideas: SOCIAL_POST_IDEAS,
      conceptLabels: Object.fromEntries(
        (["market_pulse", "sub_area_deep_dive", "education", "viral_hook", "price_update"] as PostConcept[]).map(
          (c) => [c, conceptLabel(c)]
        )
      ),
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("social-posts API failed:", error)
    return NextResponse.json({ error: "Failed to build social posts" }, { status: 500 })
  }
}
