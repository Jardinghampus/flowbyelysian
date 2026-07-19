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
  | "what_id_buy"
  | "listing_as_brand"
  | "first_impression"
  | "seller_questions"

export type FocusCommunity = {
  id: FocusCommunityId
  label: string
  communities: string[]
  tagline: string
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
  /** ROI role for briefing */
  roiRole: "proof" | "trust" | "authority" | "desire" | "reach"
}

/**
 * Monthly calendar aligned to Serhant micro media house bible.
 * Day = day-of-month (1–28).
 */
export const MONTHLY_POST_SCHEDULE: ScheduleSlot[] = [
  { day: 1, communityId: "arabian-ranches", concept: "first_impression", label: "AR 8-second hook", roiRole: "reach" },
  { day: 2, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 1", roiRole: "proof" },
  { day: 3, communityId: "mudon", concept: "education", label: "Mudon education", roiRole: "trust" },
  { day: 4, communityId: "mudon", concept: "sub_area_deep_dive", label: "Mudon sub-area deep dive", roiRole: "authority" },
  { day: 5, communityId: "town-square", concept: "what_id_buy", label: "What I'd buy · Town Square", roiRole: "desire" },
  { day: 6, communityId: "villanova", concept: "seller_questions", label: "3 questions before you list", roiRole: "desire" },
  { day: 7, communityId: "dubai-hills", concept: "listing_as_brand", label: "List like a brand · DH", roiRole: "desire" },
  { day: 8, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 2", roiRole: "proof" },
  { day: 9, communityId: "dubai-hills", concept: "education", label: "Dubai Hills education", roiRole: "trust" },
  { day: 10, communityId: "dubai-hills", concept: "price_update", label: "Dubai Hills price update", roiRole: "desire" },
  { day: 11, communityId: "mira-oasis", concept: "market_pulse", label: "Mira Oasis pulse", roiRole: "authority" },
  { day: 12, communityId: "arabian-ranches", concept: "sub_area_deep_dive", label: "AR cluster deep dive", roiRole: "authority" },
  { day: 13, communityId: "arabian-ranches", concept: "what_id_buy", label: "What I'd buy · AR", roiRole: "desire" },
  { day: 14, communityId: "mudon", concept: "listing_as_brand", label: "List like a brand · Mudon", roiRole: "desire" },
  { day: 15, communityId: "mudon", concept: "viral_hook", label: "Mudon viral hook", roiRole: "reach" },
  { day: 16, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 3", roiRole: "proof" },
  { day: 17, communityId: "town-square", concept: "education", label: "Town Square education", roiRole: "trust" },
  { day: 18, communityId: "town-square", concept: "price_update", label: "Town Square price update", roiRole: "desire" },
  { day: 19, communityId: "villanova", concept: "sub_area_deep_dive", label: "Villanova deep dive", roiRole: "authority" },
  { day: 20, communityId: "villanova", concept: "first_impression", label: "Villanova 8-second hook", roiRole: "reach" },
  { day: 21, communityId: "mira-oasis", concept: "seller_questions", label: "Seller questions · Mira", roiRole: "desire" },
  { day: 22, communityId: "weekly", concept: "weekly_transactions", label: "New transactions · week 4", roiRole: "proof" },
  { day: 23, communityId: "mira-oasis", concept: "sub_area_deep_dive", label: "Mira Oasis deep dive", roiRole: "authority" },
  { day: 24, communityId: "mira-oasis", concept: "what_id_buy", label: "What I'd buy · Mira", roiRole: "desire" },
  { day: 25, communityId: "dubai-hills", concept: "market_pulse", label: "Dubai Hills pulse", roiRole: "authority" },
  { day: 26, communityId: "arabian-ranches", concept: "listing_as_brand", label: "List like a brand · AR", roiRole: "desire" },
  { day: 27, communityId: "town-square", concept: "market_pulse", label: "Town Square pulse", roiRole: "authority" },
  { day: 28, communityId: "villanova", concept: "viral_hook", label: "Villanova brand hook", roiRole: "reach" },
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
  salePricePerSqft: number | null
  propertyTypeHint: string
  bedsMix: string | null
  topSubAreas: string | null
  sampleWindow: string | null
}

export type HighlightTransaction = {
  place: string
  bedsLabel: string
  propertyType: string
  priceLabel: string
  dealType: "sale" | "rent"
  ppsLabel?: string | null
  dateLabel?: string | null
}

export type DeskPostedState = {
  postedIgAt: string | null
  postedLiAt: string | null
  deskStatus: string
}

export type BuiltSocialPost = {
  id: string
  communityId: ScheduleCommunityId
  communityLabel: string
  concept: PostConcept
  scheduleDay: number | null
  scheduleLabel: string
  roiRole: ScheduleSlot["roiRole"]
  hook: string
  headline: string
  rentLabel: string
  saleLabel: string
  trustLine: string
  /** @deprecated use captionIg */
  caption: string
  captionIg: string
  captionLi: string
  hashtags: string
  metrics: SocialPostMetrics
  highlights?: HighlightTransaction[]
  status: "ready" | "needs_data"
  postedIgAt?: string | null
  postedLiAt?: string | null
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
    case "what_id_buy":
      return "What I'd Buy"
    case "listing_as_brand":
      return "List Like a Brand"
    case "first_impression":
      return "8-Second Hook"
    case "seller_questions":
      return "Seller Questions"
  }
}

export function roiRoleLabel(role: ScheduleSlot["roiRole"]): string {
  switch (role) {
    case "proof":
      return "Proof"
    case "trust":
      return "Trust"
    case "authority":
      return "Authority"
    case "desire":
      return "Desire"
    case "reach":
      return "Reach"
  }
}

type AgentBits = {
  fullName: string
  phone: string
  handle?: string
}

function agentFooterIg(agent: AgentBits) {
  const phone = agent.phone?.trim() || "DM for number"
  return `${agent.fullName} · ${phone}\n${TEAM_COMPANY_NAME}\n${TEAM_COMPANY_WEBSITE}`
}

function agentFooterLi(agent: AgentBits) {
  const phone = agent.phone?.trim() || "message me directly"
  return `${agent.fullName}\nVilla & Townhouse Specialist · Dubai Land\n${phone}\n${TEAM_COMPANY_NAME} · ${TEAM_COMPANY_WEBSITE}`
}

type CaptionBundle = {
  hook: string
  headline: string
  captionIg: string
  captionLi: string
  hashtags: string
  trustLine: string
}

function igHashtags(focusLabel: string) {
  return [
    "#DubaiRealEstate",
    "#DubaiVillas",
    "#DubaiTownhouses",
    `#${focusLabel.replace(/\s+/g, "")}`,
    "#PropertyInvestment",
    "#DubaiLand",
    "#Zaylo",
  ].join(" ")
}

export function buildCaption(
  concept: PostConcept,
  focus: FocusCommunity,
  metrics: SocialPostMetrics,
  agent: AgentBits
): CaptionBundle {
  const place = metrics.subArea ? `${metrics.subArea}, ${focus.label}` : focus.label
  const rent = formatAedCompact(metrics.rentAvg ?? metrics.rentMedian)
  const sale = formatAedCompact(metrics.saleAvg ?? metrics.saleMedian)
  const samples = metrics.rentCount + metrics.saleCount
  const trustLine =
    samples > 0
      ? [
          metrics.sampleWindow || `${samples} recent Bayut txs`,
          metrics.propertyTypeHint,
          metrics.bedsMix ? `Beds: ${metrics.bedsMix}` : null,
          metrics.avgPricePerSqft
            ? `~AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")}/sqft`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "Needs fresh transaction import before posting"

  const hashtags = igHashtags(focus.label)
  let hook = ""
  let headline = ""
  let igBody: string[] = []
  let liBody: string[] = []

  switch (concept) {
    case "market_pulse":
      hook = `${focus.label}: the real rent vs sale number right now`
      headline = `${focus.label.toUpperCase()} PULSE`
      igBody = [
        `📍 ${place}`,
        ``,
        `Rent avg: ${rent}${metrics.rentMedian ? ` · med ${formatAedCompact(metrics.rentMedian)}` : ""}`,
        `Sale avg: ${sale}${metrics.saleMedian ? ` · med ${formatAedCompact(metrics.saleMedian)}` : ""}`,
        metrics.avgPricePerSqft
          ? `📐 ~AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")} / sqft`
          : "",
        metrics.bedsMix ? `🛏 ${metrics.bedsMix}` : "",
        metrics.topSubAreas ? `🗺 Hot clusters: ${metrics.topSubAreas}` : "",
        ``,
        `This is the pulse — not the deal.`,
        `DM "Market" for a private shortlist.`,
      ].filter(Boolean)
      liBody = [
        `Market memo — ${focus.label}`,
        ``,
        `I track villa and townhouse transactions across Dubai land every week. Here is the live pulse for ${place}.`,
        ``,
        `Rent average: ${rent}${metrics.rentMedian ? ` (median ${formatAedCompact(metrics.rentMedian)})` : ""} · ${metrics.rentCount} rent txs`,
        `Sale average: ${sale}${metrics.saleMedian ? ` (median ${formatAedCompact(metrics.saleMedian)})` : ""} · ${metrics.saleCount} sale txs`,
        metrics.avgPricePerSqft
          ? `Approx AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")} per sqft in this sample.`
          : "",
        metrics.bedsMix ? `Beds dominating the sample: ${metrics.bedsMix}.` : "",
        metrics.topSubAreas ? `Most active clusters: ${metrics.topSubAreas}.` : "",
        metrics.sampleWindow ? `Sample: ${metrics.sampleWindow}.` : "",
        ``,
        `The average is a starting point — not the deal. Layout, plot, street, and owner motivation still move price by hundreds of thousands.`,
        ``,
        `If you are buying or selling in ${focus.label}, message me "Market" and I will send a shortlist sized to your budget within 48 hours.`,
        ``,
        `I focus exclusively on Dubai land villas and townhouses — Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai Hills, Town Square.`,
      ].filter(Boolean)
      break
    case "sub_area_deep_dive":
      hook = metrics.subArea
        ? `${metrics.subArea} inside ${focus.label} — what the avg hides`
        : `${focus.label} by sub-area — where the edge is`
      headline = metrics.subArea ? metrics.subArea.toUpperCase() : `${focus.label.toUpperCase()} · SUB-AREAS`
      igBody = [
        `Deep dive: ${place}`,
        ``,
        `Rent: ${rent} · Sale: ${sale}`,
        ``,
        `Two homes on the same street can be AED hundreds of thousands apart.`,
        `I track ${focus.label} so you don't buy the average.`,
        ``,
        `DM "Market"`,
      ]
      liBody = [
        `Sub-area note — ${place}`,
        ``,
        `In ${focus.label}, the community average hides the real market. Street, phase, and layout create the spread.`,
        ``,
        `Current sample: rent ${rent} · sale ${sale}.`,
        metrics.topSubAreas ? `Volume clusters right now: ${metrics.topSubAreas}.` : "",
        ``,
        `I do not sell "the average home." I sell the right street for your use case — family, yield, or exit liquidity.`,
        ``,
        `Message me if you want a cluster-level shortlist for ${focus.label}.`,
      ].filter(Boolean)
      break
    case "education":
      hook = `Stop buying the headline number in ${focus.label}`
      headline = "THE NUMBER ≠ THE DEAL"
      igBody = [
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
        `DM "Market"`,
      ]
      liBody = [
        `Averages are not advice.`,
        ``,
        `In ${focus.label}, rent sits around ${rent} and sales around ${sale} in the current sample. That is useful context — and dangerous if you treat it as the offer price.`,
        ``,
        `Four variables move deals more than the headline number:`,
        `1. Layout and upgrade quality`,
        `2. Plot geometry (corner vs back-to-back)`,
        `3. Street noise and park proximity`,
        `4. Owner motivation and timeline`,
        ``,
        `This is how you become selective instead of busy.`,
        ``,
        `If you want a deal-level read for ${focus.label}, reply "Market" with your budget and beds.`,
      ]
      break
    case "viral_hook":
      hook = `Everyone asks me about ${focus.label}. Here's the honest answer.`
      headline = "THE HONEST ANSWER"
      igBody = [
        focus.tagline,
        ``,
        `Live pulse → Rent ${rent} · Sale ${sale}`,
        ``,
        `I'm building the clearest villa / townhouse desk for Dubai land.`,
        `Not Marina. Not Downtown.`,
        ``,
        `DM "Market"`,
      ]
      liBody = [
        `The honest answer on ${focus.label}`,
        ``,
        focus.tagline,
        ``,
        `Live pulse from recent transactions: rent ${rent} · sale ${sale}.`,
        ``,
        `I built my desk around Dubai land villas and townhouses on purpose. Narrow beats loud. If that is your market, you will see the numbers here every week — no fluff.`,
        ``,
        `Message me if you want the shortlist, not the scroll.`,
      ]
      break
    case "price_update":
      hook = `${focus.label} price update — rent & sale`
      headline = "PRICE UPDATE"
      igBody = [
        `📍 ${place}`,
        ``,
        `Rent avg: ${rent} (${metrics.rentCount} txs)`,
        `Sale avg: ${sale} (${metrics.saleCount} txs)`,
        metrics.avgPricePerSqft
          ? `📐 ~AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")} / sqft`
          : "",
        ``,
        `DM "Market"`,
      ].filter(Boolean)
      liBody = [
        `Price update — ${focus.label}`,
        ``,
        `Rent: ${rent} across ${metrics.rentCount} transactions.`,
        `Sale: ${sale} across ${metrics.saleCount} transactions.`,
        metrics.avgPricePerSqft
          ? `Approx AED ${Math.round(metrics.avgPricePerSqft).toLocaleString("en-AE")} / sqft.`
          : "",
        ``,
        `Bookmark this before your next viewing week. If you want a private shortlist sized to budget, message me "Market".`,
      ].filter(Boolean)
      break
    case "what_id_buy":
      hook = `What I'd buy in ${focus.label} this week`
      headline = "WHAT I'D BUY"
      igBody = [
        `📍 ${place}`,
        ``,
        `Sale band: ${sale}`,
        `Rent band: ${rent}`,
        metrics.bedsMix ? `Focus beds: ${metrics.bedsMix}` : "",
        metrics.topSubAreas ? `I'd look first: ${metrics.topSubAreas}` : "",
        ``,
        `Not financial advice — my desk filter.`,
        `DM "Shortlist"`,
      ].filter(Boolean)
      liBody = [
        `What I would buy in ${focus.label} this week`,
        ``,
        `Current sale band in sample: ${sale}. Rent band: ${rent}.`,
        metrics.bedsMix ? `Beds I am screening first: ${metrics.bedsMix}.` : "",
        metrics.topSubAreas ? `Clusters I would walk first: ${metrics.topSubAreas}.` : "",
        ``,
        `This is not a tip. It is how I filter inventory for clients who want Dubai land villas and townhouses without wasting viewing weeks.`,
        ``,
        `If your budget sits near this band, message me "Shortlist" and I will send three options with comps.`,
      ].filter(Boolean)
      break
    case "listing_as_brand":
      hook = `Portal ads don't sell. Brands do — ${focus.label}`
      headline = "LIST LIKE A BRAND"
      igBody = [
        `If you're selling in ${focus.label}:`,
        ``,
        `Photos are expected.`,
        `Video + story + reach = competition on price.`,
        ``,
        `Sale pulse: ${sale}`,
        `Rent pulse: ${rent}`,
        ``,
        `DM "Owner" for a street-level brand plan.`,
      ]
      liBody = [
        `Sell your home in ${focus.label} like a luxury brand — not a portal ad.`,
        ``,
        `Luxury buyers purchase lifestyle and perception. The way a property is positioned changes the offers it attracts.`,
        ``,
        `My desk approach:`,
        `1) Emotion — a short lifestyle clip, not only stills`,
        `2) Story — street, plot, light, layout (not just bed count)`,
        `3) Reach — my Market Desk audience on Instagram + LinkedIn, plus comps from live transactions`,
        `4) Positioning — rare opportunity framing backed by this week's numbers (sale ${sale} · rent ${rent})`,
        ``,
        `If you want a quiet read on your home before you list, message me "Owner".`,
      ]
      break
    case "first_impression":
      hook = `${sale} — that's the ${focus.label} sale pulse. 8 seconds.`
      headline = "8 SECONDS"
      igBody = [
        `${focus.label.toUpperCase()}`,
        ``,
        `Sale: ${sale}`,
        `Rent: ${rent}`,
        metrics.topSubAreas ? `Clusters: ${metrics.topSubAreas}` : "",
        ``,
        `You have 8 seconds online.`,
        `I lead with the number — then the deal.`,
        ``,
        `DM "Market"`,
      ].filter(Boolean)
      liBody = [
        `First impression — ${focus.label}`,
        ``,
        `Attention is scarce. I lead with one clear number, then context.`,
        ``,
        `Sale average in sample: ${sale}. Rent: ${rent}.`,
        metrics.sampleWindow ? `Sample window: ${metrics.sampleWindow}.` : "",
        ``,
        `The brand people hire is the one that shows up with clarity — every week — in the communities that matter.`,
        ``,
        `Message "Market" for a private shortlist.`,
      ].filter(Boolean)
      break
    case "seller_questions":
      hook = `3 questions to ask before you list in ${focus.label}`
      headline = "BEFORE YOU LIST"
      igBody = [
        `1) How will you use video — not just photos?`,
        `2) What reach beyond the portal?`,
        `3) How do you elevate perception so buyers compete?`,
        ``,
        `Vague answers = value left on the table.`,
        ``,
        `${focus.label} pulse → Sale ${sale} · Rent ${rent}`,
        ``,
        `DM "Owner"`,
      ]
      liBody = [
        `Before you list in ${focus.label}, ask your agent these three questions:`,
        ``,
        `1) How will you use video to tell the story of my home — not only still photography?`,
        `2) What reach do you have beyond local portal browsers (your own audience, expats, investors)?`,
        `3) How will your marketing elevate perception so buyers compete — instead of me competing on price?`,
        ``,
        `If the answers are unclear, you may be leaving value on the table.`,
        ``,
        `Current desk pulse for context: sale ${sale} · rent ${rent}.`,
        ``,
        `I market Dubai land homes like a brand campaign on top of live comps. Message "Owner" for a street-level plan.`,
      ]
      break
    case "weekly_transactions":
      hook = "This week on my desk"
      headline = "NEW TRANSACTIONS"
      igBody = []
      liBody = []
      break
  }

  const captionIg = [...igBody, "", agentFooterIg(agent), "", hashtags].join("\n")
  const captionLi = [...liBody, "", agentFooterLi(agent)].join("\n")

  return { hook, headline, captionIg, captionLi, hashtags, trustLine }
}

export function buildWeeklyCaption(
  highlights: HighlightTransaction[],
  agent: AgentBits,
  weekLabel: string
): CaptionBundle {
  const hashtags = igHashtags("DubaiLand")
  const lines = highlights.map((h, i) => {
    const type = h.dealType === "sale" ? "Sold" : "Rented"
    const extra = [h.ppsLabel, h.dateLabel].filter(Boolean).join(" · ")
    return `${i + 1}. ${h.place} · ${h.bedsLabel} ${h.propertyType} · ${type} ${h.priceLabel}${extra ? ` · ${extra}` : ""}`
  })

  const hook = "This week on my desk — 5 transactions worth knowing"
  const headline = "NEW TRANSACTIONS"
  const trustLine =
    highlights.length >= 5
      ? "Weekly market desk · Dubai land villas & townhouses"
      : "Needs more recent transactions — run scrape-transactions"

  const captionIg = [
    weekLabel,
    "",
    "This week on my desk:",
    "",
    ...lines,
    "",
    "I track Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai Hills & Town Square every week.",
    'DM "Market" for a shortlist sized to your budget.',
    "",
    agentFooterIg(agent),
    "",
    hashtags,
  ].join("\n")

  const captionLi = [
    weekLabel,
    "",
    "This week on my desk — five transactions landlords and buyers should know about in Dubai land.",
    "",
    ...lines,
    "",
    "I do not post these to chase likes. I post them so serious buyers and sellers see that I live in the comps — Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai Hills, Town Square.",
    "",
    "If you want a private shortlist for your budget and beds, message me \"Market\". If you own in these communities and want a quiet sale read, message me \"Owner\".",
    "",
    agentFooterLi(agent),
  ].join("\n")

  return { hook, headline, captionIg, captionLi, hashtags, trustLine }
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
    salePricePerSqft: null,
    propertyTypeHint: "Villa / Townhouse",
    bedsMix: null,
    topSubAreas: null,
    sampleWindow: null,
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

/** Playbook scripts for Media Desk */
export const MEDIA_DESK_PLAYBOOK = {
  dmReply: `Thanks for writing Market.

Quick qualify so I send the right shortlist:
1) Buy or sell?
2) Budget (AED)?
3) Beds?
4) Preferred communities? (AR / Mira / Mudon / Villanova / Dubai Hills / Town Square)
5) Timeline?

I'll reply within a few hours with 3 options + comps.`,
  liReply: `Thanks for reaching out.

I cover Dubai land villas and townhouses — Arabian Ranches, Mira Oasis, Mudon, Villanova, Dubai Hills, Town Square.

Share budget, beds, and timeline and I'll send a short private shortlist with recent comps.`,
  coldOwner: `Hi {name} — I track closed deals weekly in {community}.

This week's desk note is live (rent/sale comps for villas & townhouses). Attach the Media Desk PNG before you send.

If you're considering a quiet sale or a rent reset, I can give you a street-level read — no pitch deck.
Reply "Owner" or WhatsApp me and I'll send the relevant comps for your home.

Rule: never cold without this week's proof asset.`,
  coldBuyer: `Hi {name} — private shortlist angle in {community} based on this week's closed comps (Media Desk), not portal averages.

If useful, I can send 3 options + why each fits. Reply "Shortlist".
Attach this week's PNG when you send.`,
  ownerBrandPitch: `I don't list homes as portal ads. I market them like a brand.

For your home in {community}:
1) Lifestyle clip + stills
2) Comps from my weekly Dubai Land desk
3) Distribution to people who already follow Market Desk
4) Quiet owner strategy if you want off-market first

Ask any agent: video? reach beyond portal? perception that makes buyers compete?
Vague answers = value left on the table.

Reply "Owner".`,
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

export const SOCIAL_EXPORT_WIDTH = 1080
export const SOCIAL_EXPORT_HEIGHT = 1350
export const CATEGORY_LOCK = "Dubai Land · Villas & Townhouses"
