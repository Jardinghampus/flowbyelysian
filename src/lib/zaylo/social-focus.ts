import { TEAM_COMPANY_NAME, TEAM_COMPANY_WEBSITE } from "@/lib/brand"

/** Focus communities for villa/townhouse authority content (min 2 posts each / month). */
export type FocusCommunityId =
  | "arabian-ranches"
  | "mira-oasis"
  | "mudon"
  | "villanova"
  | "dubai-hills"
  | "town-square"

export type ScheduleCommunityId = FocusCommunityId | "weekly"

export type PostConcept =
  | "market_pulse"
  | "sub_area_deep_dive"
  | "education"
  | "viral_hook"
  | "price_update"
  | "weekly_transactions"

export type FocusCommunity = {
  id: FocusCommunityId
  label: string
  /** DB community / master_community match values */
  communities: string[]
  tagline: string
  /** Preferred property types for this beat */
  propertyTypes: Array<"Villa" | "Townhouse">
}

export const FOCUS_COMMUNITIES: FocusCommunity[] = [
  {
    id: "arabian-ranches",
    label: "Arabian Ranches",
    communities: ["Arabian Ranches", "Arabian Ranches 2", "Arabian Ranches 3"],
    tagline: "Family villas & townhouses — the classic Dubai land play",
    propertyTypes: ["Villa", "Townhouse"],
  },
  {
    id: "mira-oasis",
    label: "Mira Oasis",
    communities: ["Mira Oasis"],
    tagline: "Townhouse yields & handover-era pricing",
    propertyTypes: ["Townhouse", "Villa"],
  },
  {
    id: "mudon",
    label: "Mudon",
    communities: ["Mudon"],
    tagline: "Arabella, Al Ranim, Rahat — layout & plot change everything",
    propertyTypes: ["Townhouse", "Villa"],
  },
  {
    id: "villanova",
    label: "Villanova",
    communities: ["Villanova"],
    tagline: "Dubailand townhouses — street & phase matter",
    propertyTypes: ["Townhouse"],
  },
  {
    id: "dubai-hills",
    label: "Dubai Hills",
    communities: ["Dubai Hills Estate"],
    tagline: "Hills-side villas & townhouses — golf, parks, families",
    propertyTypes: ["Villa", "Townhouse"],
  },
  {
    id: "town-square",
    label: "Town Square",
    communities: ["Town Square"],
    tagline: "Entry-level townhouses — Hayat, Noor, Reem & friends",
    propertyTypes: ["Townhouse"],
  },
]

export type ScheduleSlot = {
  day: number
  communityId: ScheduleCommunityId
  concept: PostConcept
  label: string
}

/**
 * Fixed monthly calendar — each focus community ≥2×, plus weekly "5 transactions" every week.
 * Day = day-of-month (1–28 so every month works).
 */
export const MONTHLY_POST_SCHEDULE: ScheduleSlot[] = [
  { day: 1, communityId: "arabian-ranches", concept: "market_pulse", label: "AR rent vs sale pulse" },
  { day: 2, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 1" },
  { day: 3, communityId: "mudon", concept: "sub_area_deep_dive", label: "Mudon sub-area deep dive" },
  { day: 5, communityId: "town-square", concept: "education", label: "Town Square education" },
  { day: 7, communityId: "villanova", concept: "viral_hook", label: "Villanova viral hook" },
  { day: 8, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 2" },
  { day: 9, communityId: "dubai-hills", concept: "price_update", label: "Dubai Hills price update" },
  { day: 11, communityId: "mira-oasis", concept: "market_pulse", label: "Mira Oasis pulse" },
  { day: 13, communityId: "arabian-ranches", concept: "sub_area_deep_dive", label: "AR cluster deep dive" },
  { day: 15, communityId: "mudon", concept: "viral_hook", label: "Mudon viral hook" },
  { day: 16, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 3" },
  { day: 17, communityId: "town-square", concept: "price_update", label: "Town Square price update" },
  { day: 19, communityId: "villanova", concept: "education", label: "Villanova education" },
  { day: 21, communityId: "dubai-hills", concept: "market_pulse", label: "Dubai Hills pulse" },
  { day: 22, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 4" },
  { day: 23, communityId: "mira-oasis", concept: "sub_area_deep_dive", label: "Mira Oasis deep dive" },
  { day: 25, communityId: "arabian-ranches", concept: "education", label: "AR education (bonus)" },
  { day: 27, communityId: "town-square", concept: "viral_hook", label: "Town Square viral (bonus)" },
]

export type SocialPostMetrics = {
  community: string
  subArea: string | null
  rentAvg: number | null
  saleAvg: number | null
  rentMedian: number | null
  saleMedian: number | null
  rentCount: number
  saleCount: number
  avgPricePerSqft: number | null
  propertyTypeHint: string
}

/** One row on the weekly "5 transactions" card — desk-framing, not closed-deal claims. */
export type HighlightTransaction = {
  place: string
  bedsLabel: string
  propertyType: string
  priceLabel: string
  dealType: "sale" | "rent"
}

export type BuiltSocialPost = {
  id: string
  communityId: ScheduleCommunityId
  communityLabel: string
  concept: PostConcept
  scheduleDay: number | null
  scheduleLabel: string
  hook: string
  headline: string
  rentLabel: string
  saleLabel: string
  trustLine: string
  caption: string
  hashtags: string
  metrics: SocialPostMetrics
  highlights?: HighlightTransaction[]
  status: "ready" | "needs_data"
}

export function formatAedCompact(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—"
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `AED ${m >= 10 ? Math.round(m) : m.toFixed(1)}M`
  }
  if (value >= 1_000) return `AED ${Math.round(value / 1000)}K`
  return `AED ${Math.round(value).toLocaleString("en-AE")}`
}

export function conceptLabel(concept: PostConcept): string {
  switch (concept) {
    case "market_pulse":
      return "Market Pulse"
    case "sub_area_deep_dive":
      return "Sub-area Deep Dive"
    case "education":
      return "Education"
    case "viral_hook":
      return "Viral Hook"
    case "price_update":
      return "Price Update"
    case "weekly_transactions":
      return "New Transactions"
  }
}

type AgentBits = {
  fullName: string
  phone: string
  handle?: string
}

function agentFooter(agent: AgentBits) {
  const phone = agent.phone?.trim() || "DM for number"
  return `${agent.fullName} · ${phone}\n${TEAM_COMPANY_NAME}\n${TEAM_COMPANY_WEBSITE}`
}

export function buildCaption(
  concept: PostConcept,
  focus: FocusCommunity,
  metrics: SocialPostMetrics,
  agent: AgentBits
): { hook: string; headline: string; caption: string; hashtags: string; trustLine: string } {
  const place = metrics.subArea ? `${metrics.subArea}, ${focus.label}` : focus.label
  const rent = formatAedCompact(metrics.rentAvg ?? metrics.rentMedian)
  const sale = formatAedCompact(metrics.saleAvg ?? metrics.saleMedian)
  const samples = metrics.rentCount + metrics.saleCount
  const trustLine =
    samples > 0
      ? `Based on ${samples} recent Bayut transactions · ${metrics.propertyTypeHint}`
      : "Needs fresh transaction import before posting"

  const hashtags = [
    "#DubaiRealEstate",
    "#DubaiVillas",
    "#DubaiTownhouses",
    `#${focus.label.replace(/\s+/g, "")}`,
    "#PropertyInvestment",
    "#DubaiLand",
    "#Zaylo",
  ].join(" ")

  let hook = ""
  let headline = ""
  let body: string[] = []

  switch (concept) {
    case "market_pulse":
      hook = `${focus.label}: the real rent vs sale number right now`
      headline = `${focus.label.toUpperCase()} PULSE`
      body = [
        `📍 ${place}`,
        ``,
        `Rent avg: ${rent}`,
        `Sale avg: ${sale}`,
        ``,
        `This is the pulse — not the deal.`,
        `Layout, plot, street, and owner situation still move the price.`,
        ``,
        `Save this if you track Dubai land villas & townhouses.`,
      ]
      break
    case "sub_area_deep_dive":
      hook = metrics.subArea
        ? `${metrics.subArea} inside ${focus.label} — what the avg hides`
        : `${focus.label} by sub-area — where the edge is`
      headline = metrics.subArea ? metrics.subArea.toUpperCase() : `${focus.label.toUpperCase()} · SUB-AREAS`
      body = [
        `Deep dive: ${place}`,
        ``,
        `Rent: ${rent} · Sale: ${sale}`,
        ``,
        `Two homes on the same street can be AED hundreds of thousands apart.`,
        `I track ${focus.label} so you don't buy the average.`,
        ``,
        `Comment "Market" in DM and I'll get back to you.`,
      ]
      break
    case "education":
      hook = `Stop buying the headline number in ${focus.label}`
      headline = "THE NUMBER ≠ THE DEAL"
      body = [
        `${place}`,
        ``,
        `Everyone screenshots the average.`,
        `Rent ${rent} · Sale ${sale}`,
        ``,
        `What actually moves the deal:`,
        `• Layout & upgrade quality`,
        `• Plot / back-to-back vs corner`,
        `• Street noise & park proximity`,
        `• Motivated vs patient owner`,
        ``,
        `That's how you become selective — not just busy.`,
      ]
      break
    case "viral_hook":
      hook = `Everyone asks me about ${focus.label}. Here's the honest answer.`
      headline = "THE HONEST ANSWER"
      body = [
        focus.tagline,
        ``,
        `Live pulse → Rent ${rent} · Sale ${sale}`,
        ``,
        `I'm building the clearest villa / townhouse desk for Dubai land.`,
        `Not Marina apartments. Not Downtown noise.`,
        ``,
        `Follow for weekly ${focus.label} numbers — no fluff.`,
      ]
      break
    case "price_update":
      hook = `${focus.label} price update — rent & sale`
      headline = "PRICE UPDATE"
      body = [
        `📍 ${place}`,
        ``,
        `🟢 Rent avg: ${rent} (${metrics.rentCount} txs)`,
        `🔵 Sale avg: ${sale} (${metrics.saleCount} txs)`,
        metrics.avgPricePerSqft
          ? `📐 ~AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")} / sqft`
          : "",
        ``,
        `Bookmark this for your next viewing week.`,
        `Write "Market" in DM and I'll get back to you.`,
      ].filter(Boolean)
      break
    case "weekly_transactions":
      // Built separately via buildWeeklyCaption
      hook = "This week on my desk"
      headline = "NEW TRANSACTIONS"
      body = []
      break
  }

  const caption = [...body, "", agentFooter(agent), "", hashtags].join("\n")

  return { hook, headline, caption, hashtags, trustLine }
}

/** Weekly USP post: 5 desk-worthy txs, no "why" — market update framed as your beat. */
export function buildWeeklyCaption(
  highlights: HighlightTransaction[],
  agent: AgentBits,
  weekLabel: string
): { hook: string; headline: string; caption: string; hashtags: string; trustLine: string } {
  const hashtags = [
    "#DubaiRealEstate",
    "#DubaiVillas",
    "#DubaiTownhouses",
    "#DubaiLand",
    "#PropertyMarket",
    "#Zaylo",
  ].join(" ")

  const lines = highlights.map((h, i) => {
    const type = h.dealType === "sale" ? "Sold" : "Rented"
    return `${i + 1}. ${h.place} · ${h.bedsLabel} ${h.propertyType} · ${type} ${h.priceLabel}`
  })

  const hook = "This week on my desk — 5 transactions worth knowing"
  const headline = "NEW TRANSACTIONS"
  const trustLine =
    highlights.length >= 5
      ? "Weekly market desk · Dubai land villas & townhouses"
      : "Needs more recent transactions — run scrape-transactions"

  const caption = [
    weekLabel,
    "",
    "This week on my desk:",
    "",
    ...lines,
    "",
    "I track Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai Hills & Town Square every week.",
    "Write \"Market\" in DM if you want the shortlist for your budget.",
    "",
    agentFooter(agent),
    "",
    hashtags,
  ].join("\n")

  return { hook, headline, caption, hashtags, trustLine }
}

export function emptyMetrics(label = "Dubai Land"): SocialPostMetrics {
  return {
    community: label,
    subArea: null,
    rentAvg: null,
    saleAvg: null,
    rentMedian: null,
    saleMedian: null,
    rentCount: 0,
    saleCount: 0,
    avgPricePerSqft: null,
    propertyTypeHint: "Villa / Townhouse",
  }
}

export function postsPerCommunityThisMonth(): Record<FocusCommunityId, number> {
  const counts = Object.fromEntries(FOCUS_COMMUNITIES.map((c) => [c.id, 0])) as Record<
    FocusCommunityId,
    number
  >
  for (const slot of MONTHLY_POST_SCHEDULE) {
    if (slot.communityId === "weekly") continue
    counts[slot.communityId] += 1
  }
  return counts
}

export const SOCIAL_POST_IDEAS = [
  "Before/after: asking price vs last 5 sold in the same cluster",
  "Owner psychology: why this street closes faster",
  "3BR vs 4BR yield comparison in one community",
  "Pocket listing teaser (no address) + DM CTA",
  "Myth-bust carousel: 'Town Square is only for first-time buyers'",
  "Weekly 'what I would buy this week with AED X'",
  "Sub-area ranking: best value / best lifestyle / best yield",
  "Client story (anonymous): the upgrade that paid for itself",
]

/** IG portrait — export at this exact size. */
export const SOCIAL_EXPORT_WIDTH = 1080
export const SOCIAL_EXPORT_HEIGHT = 1350
