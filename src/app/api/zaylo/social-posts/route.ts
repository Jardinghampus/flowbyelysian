import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { getAgentProfileByUserId } from "@/lib/user-profile"
import { createUntypedServerClient } from "@/lib/supabase/server-untyped"
import {
  FOCUS_COMMUNITIES,
  MONTHLY_POST_SCHEDULE,
  MEDIA_DESK_PLAYBOOK,
  buildCaption,
  buildWeeklyCaption,
  conceptLabel,
  emptyMetrics,
  type BuiltSocialPost,
  type FocusCommunity,
  type HighlightTransaction,
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
  bedrooms: number | null
  transaction_date: string | null
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
    return c === n || m === n || c.includes(n) || m.includes(n) || (c.length > 2 && n.includes(c))
  })
}

function matchesAnyFocus(row: TxLite): boolean {
  return FOCUS_COMMUNITIES.some((focus) => matchesFocus(row, focus))
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

function pickTopSubAreas(rows: TxLite[], limit = 3): string | null {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const sub = row.sub_area?.trim()
    if (!sub) continue
    counts.set(sub, (counts.get(sub) || 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
  if (!ranked.length) return null
  return ranked.map(([name]) => name).join(" · ")
}

function bedsMixLabel(rows: TxLite[]): string | null {
  const counts = new Map<number, number>()
  for (const row of rows) {
    if (row.bedrooms == null) continue
    counts.set(row.bedrooms, (counts.get(row.bedrooms) || 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  if (!ranked.length) return null
  return ranked
    .map(([beds]) => (beds === 0 ? "Studio" : `${beds}BR`))
    .join(" · ")
}

function sampleWindowLabel(rows: TxLite[]): string | null {
  if (!rows.length) return null
  const dates = rows
    .map((r) => r.transaction_date)
    .filter((d): d is string => Boolean(d))
    .sort()
  const n = rows.length
  if (!dates.length) return `${n} txs in sample`
  const oldest = dates[0]!
  const newest = dates[dates.length - 1]!
  if (oldest === newest) return `${n} txs · ${newest}`
  return `${n} txs · ${oldest} → ${newest}`
}

function computeMetrics(
  focus: FocusCommunity,
  all: TxLite[],
  forceSubArea?: string | null
): SocialPostMetrics {
  let rows = all.filter((r) => matchesFocus(r, focus) && isVillaTownhouse(r))
  if (!rows.length) {
    rows = all.filter((r) => matchesFocus(r, focus))
  }

  const subArea = forceSubArea || (rows.length ? pickTopSubArea(rows) : null)
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
  const salePps = useRows
    .filter((r) => r.transaction_type === "sale")
    .map((r) => Number(r.price_per_sqft_aed))
    .filter((n) => n > 0)

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
    salePricePerSqft: avg(salePps),
    propertyTypeHint,
    bedsMix: bedsMixLabel(useRows),
    topSubAreas: pickTopSubAreas(rows),
    sampleWindow: sampleWindowLabel(useRows),
  }
}

function formatBeds(beds: number | null): string {
  if (beds == null) return ""
  if (beds === 0) return "Studio"
  return `${beds}BR`
}

function formatPrice(price: number | null): string {
  if (price == null || price <= 0) return "—"
  if (price >= 1_000_000) {
    const m = price / 1_000_000
    return `AED ${m >= 10 ? Math.round(m) : m.toFixed(1)}M`
  }
  if (price >= 1_000) return `AED ${Math.round(price / 1000)}K`
  return `AED ${Math.round(price).toLocaleString("en-AE")}`
}

function interestScore(row: TxLite): number {
  const price = Number(row.price_aed) || 0
  const pps = Number(row.price_per_sqft_aed) || 0
  const beds = row.bedrooms ?? 0
  let score = 0
  if (row.transaction_type === "sale") score += 40
  else score += 10
  if (price >= 8_000_000) score += 35
  else if (price >= 5_000_000) score += 28
  else if (price >= 3_000_000) score += 20
  else if (price >= 1_800_000) score += 12
  else if (price >= 900_000) score += 6
  if (pps >= 1600) score += 18
  else if (pps >= 1200) score += 10
  if (beds >= 5) score += 10
  else if (beds >= 4) score += 6
  if (isVillaTownhouse(row)) score += 15
  return score
}

/** Pick 5 desk-worthy txs across focus markets — diversified, no "why" exposed. */
function pickInterestingTransactions(all: TxLite[], weekIndex: number): HighlightTransaction[] {
  const pool = all
    .filter((r) => matchesAnyFocus(r) && Number(r.price_aed) > 0)
    .filter((r) => isVillaTownhouse(r) || !r.property_type)

  const scored = [...pool].sort((a, b) => {
    const ds = interestScore(b) - interestScore(a)
    if (ds !== 0) return ds
    return (b.transaction_date || "").localeCompare(a.transaction_date || "")
  })

  // Rotate window per week so each Monday-ish post feels fresh
  const offset = (weekIndex % 4) * 7
  const rotated = [...scored.slice(offset), ...scored.slice(0, offset)]

  const picked: TxLite[] = []
  const communityCounts = new Map<string, number>()

  for (const row of rotated) {
    if (picked.length >= 5) break
    const key = (row.master_community || row.community || "x").toLowerCase()
    const n = communityCounts.get(key) || 0
    if (n >= 2) continue
    // Avoid near-duplicates (same sub + price)
    const fingerprint = `${row.sub_area}|${row.price_aed}|${row.bedrooms}`
    if (picked.some((p) => `${p.sub_area}|${p.price_aed}|${p.bedrooms}` === fingerprint)) continue
    picked.push(row)
    communityCounts.set(key, n + 1)
  }

  // Fill if diversification left us short
  for (const row of rotated) {
    if (picked.length >= 5) break
    if (picked.includes(row)) continue
    picked.push(row)
  }

  return picked.map((row) => {
    const community = row.community || row.master_community || "Dubai"
    const place = row.sub_area?.trim() ? `${row.sub_area}, ${community}` : community
    const prop = (row.property_type || "Property").replace(/town house/i, "Townhouse")
    const pps = Number(row.price_per_sqft_aed)
    return {
      place,
      bedsLabel: formatBeds(row.bedrooms) || "—",
      propertyType: prop,
      priceLabel: formatPrice(Number(row.price_aed)),
      dealType: row.transaction_type === "rent" ? "rent" : "sale",
      ppsLabel: pps > 0 ? `AED ${Math.round(pps).toLocaleString("en-AE")}/sqft` : null,
      dateLabel: row.transaction_date || null,
    }
  })
}

function buildAreaPost(
  focus: FocusCommunity,
  concept: PostConcept,
  metrics: SocialPostMetrics,
  agent: { fullName: string; phone: string },
  scheduleDay: number | null,
  scheduleLabel: string,
  roiRole: BuiltSocialPost["roiRole"] = "authority"
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
    roiRole,
    hook: copy.hook,
    headline: copy.headline,
    rentLabel:
      metrics.rentAvg != null || metrics.rentMedian != null
        ? `${metrics.rentCount} rent txs`
        : "No rent txs",
    saleLabel:
      metrics.saleAvg != null || metrics.saleMedian != null
        ? `${metrics.saleCount} sale txs`
        : "No sale txs",
    trustLine: copy.trustLine,
    caption: copy.captionIg,
    captionIg: copy.captionIg,
    captionLi: copy.captionLi,
    hashtags: copy.hashtags,
    metrics,
    status: samples > 0 ? "ready" : "needs_data",
  }
}

function buildWeeklyPost(
  highlights: HighlightTransaction[],
  agent: { fullName: string; phone: string },
  scheduleDay: number,
  scheduleLabel: string,
  weekIndex: number,
  roiRole: BuiltSocialPost["roiRole"] = "proof"
): BuiltSocialPost {
  const copy = buildWeeklyCaption(highlights, agent, scheduleLabel)
  return {
    id: `weekly-transactions-day${scheduleDay}-w${weekIndex}`,
    communityId: "weekly",
    communityLabel: "This Week",
    concept: "weekly_transactions",
    scheduleDay,
    scheduleLabel,
    roiRole,
    hook: copy.hook,
    headline: copy.headline,
    rentLabel: "",
    saleLabel: "",
    trustLine: copy.trustLine,
    caption: copy.captionIg,
    captionIg: copy.captionIg,
    captionLi: copy.captionLi,
    hashtags: copy.hashtags,
    metrics: emptyMetrics("Dubai Land"),
    highlights,
    status: highlights.length >= 5 ? "ready" : "needs_data",
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
    const [{ data, error }, postedRes] = await Promise.all([
      supabase
        .from("bayut_transactions")
        .select(
          "community, master_community, sub_area, property_type, transaction_type, price_aed, price_per_sqft_aed, bedrooms, transaction_date"
        )
        .order("transaction_date", { ascending: false })
        .limit(4000),
      supabase
        .from("zaylo_social_posts")
        .select("schedule_key, posted_ig_at, posted_li_at, desk_status")
        .not("schedule_key", "is", null)
        .limit(200),
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const postedMap = new Map<
      string,
      { postedIgAt: string | null; postedLiAt: string | null; deskStatus: string }
    >()
    for (const row of postedRes.data || []) {
      if (!row.schedule_key) continue
      postedMap.set(row.schedule_key as string, {
        postedIgAt: (row.posted_ig_at as string) || null,
        postedLiAt: (row.posted_li_at as string) || null,
        deskStatus: (row.desk_status as string) || "ready",
      })
    }

    const rows = (data || []) as TxLite[]
    const today = new Date().getDate()
    const monthKey = new Date().toISOString().slice(0, 7)
    let weeklyIndex = 0

    const scheduled: BuiltSocialPost[] = MONTHLY_POST_SCHEDULE.map((slot) => {
      let post: BuiltSocialPost
      if (slot.communityId === "weekly" || slot.concept === "weekly_transactions") {
        const idx = weeklyIndex++
        const highlights = pickInterestingTransactions(rows, idx)
        post = buildWeeklyPost(highlights, agent, slot.day, slot.label, idx, slot.roiRole)
      } else {
        const focus = FOCUS_COMMUNITIES.find((c) => c.id === slot.communityId)!
        const forceSub =
          slot.concept === "sub_area_deep_dive"
            ? pickTopSubArea(rows.filter((r) => matchesFocus(r, focus)))
            : null
        const metrics = computeMetrics(focus, rows, forceSub)
        post = buildAreaPost(focus, slot.concept, metrics, agent, slot.day, slot.label, slot.roiRole)
      }

      const scheduleKey = `${monthKey}-day${slot.day}-${slot.concept}-${slot.communityId}`
      post.id = scheduleKey
      const posted = postedMap.get(scheduleKey)
      if (posted) {
        post.postedIgAt = posted.postedIgAt
        post.postedLiAt = posted.postedLiAt
      }
      return post
    })

    const communityCards = FOCUS_COMMUNITIES.map((focus) => {
      const metrics = computeMetrics(focus, rows)
      return {
        focus,
        metrics,
        post: buildAreaPost(focus, "market_pulse", metrics, agent, null, `${focus.label} anytime pulse`),
      }
    })

    const todays = scheduled.filter((p) => p.scheduleDay === today)
    const upcoming = scheduled.filter((p) => (p.scheduleDay ?? 0) >= today).slice(0, 7)
    const catchUp = scheduled.filter(
      (p) =>
        (p.scheduleDay ?? 99) < today &&
        p.status === "ready" &&
        !(p.postedIgAt && p.postedLiAt)
    )
    const postedThisMonth = scheduled.filter((p) => p.postedIgAt || p.postedLiAt).length

    const concepts: PostConcept[] = [
      "market_pulse",
      "sub_area_deep_dive",
      "education",
      "viral_hook",
      "price_update",
      "weekly_transactions",
      "what_id_buy",
      "listing_as_brand",
      "first_impression",
      "seller_questions",
    ]

    return NextResponse.json({
      agent,
      schedule: scheduled,
      communityCards,
      today: todays,
      upcoming,
      catchUp,
      postedThisMonth,
      postsPerCommunity: postsPerCommunityThisMonth(),
      ideas: SOCIAL_POST_IDEAS,
      playbook: MEDIA_DESK_PLAYBOOK,
      conceptLabels: Object.fromEntries(concepts.map((c) => [c, conceptLabel(c)])),
      exportSize: { width: 1080, height: 1350 },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("social-posts API failed:", error)
    return NextResponse.json({ error: "Failed to build social posts" }, { status: 500 })
  }
}
