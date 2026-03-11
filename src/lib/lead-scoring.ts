/**
 * Predictive Lead Scoring Engine
 *
 * Scores opportunities (leads) on likelihood to convert, using signals from:
 *   - Lead completeness (contact info, property details)
 *   - Budget alignment vs market
 *   - Engagement signals (response speed, preferred contact)
 *   - Historical area performance
 *   - Time-based decay
 *
 * Returns a 0-100 score with a breakdown per dimension.
 */

export interface LeadScoreInput {
  // From opportunity record
  type: "buy" | "sell" | "rent" | "lease" | "relocation"
  status: string
  fullName: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  preferredContact: string | null
  area: string | null
  propertyType: string | null
  bedrooms: number | null
  size: number | null
  price: number | null
  minPrice: number | null
  maxPrice: number | null
  features: string[]
  notes: string | null
  marketComparisonPct: number | null
  createdAt: string
  updatedAt: string
  // Optional enrichment from agent performance data
  areaConversionRate?: number // 0-100, historical conversion rate for this area
}

export interface LeadScoreResult {
  score: number // 0-100
  tier: "hot" | "warm" | "cold"
  breakdown: {
    completeness: number
    budgetFit: number
    engagement: number
    areaStrength: number
    recency: number
  }
  insights: string[]
}

// ── Dimension weights (sum = 1.0) ───────────────────────────────────
const WEIGHTS = {
  completeness: 0.20,
  budgetFit: 0.25,
  engagement: 0.15,
  areaStrength: 0.20,
  recency: 0.20,
}

// ── Tier thresholds ─────────────────────────────────────────────────
const TIER_HOT = 70
const TIER_WARM = 40

// ── Scoring functions ───────────────────────────────────────────────

/** How complete is the lead's profile? More info = more serious buyer. */
function completenessScore(lead: LeadScoreInput): { score: number; insights: string[] } {
  let score = 0
  let max = 0
  const insights: string[] = []

  // Contact info (40 points)
  max += 40
  if (lead.phone) score += 15
  if (lead.email) score += 10
  if (lead.whatsapp) score += 15
  if (!lead.phone && !lead.whatsapp) insights.push("No phone or WhatsApp — hard to reach")

  // Property details (40 points)
  max += 40
  if (lead.area) score += 10
  if (lead.propertyType) score += 8
  if (lead.bedrooms) score += 7
  if (lead.size) score += 5
  if (lead.features.length > 0) score += 10
  if (!lead.area) insights.push("No area specified — unclear intent")

  // Pricing (20 points)
  max += 20
  if (lead.price || (lead.minPrice && lead.maxPrice)) score += 15
  if (lead.notes && lead.notes.length > 20) score += 5
  if (!lead.price && !lead.minPrice) insights.push("No budget specified — may not be ready")

  return { score: max > 0 ? Math.round((score / max) * 100) : 50, insights }
}

/** How well does the lead's budget align with the market? */
function budgetFitScore(lead: LeadScoreInput): { score: number; insights: string[] } {
  const insights: string[] = []

  if (lead.marketComparisonPct === null || lead.marketComparisonPct === undefined) {
    return { score: 50, insights: [] } // neutral if no market data
  }

  const pct = lead.marketComparisonPct

  if (lead.type === "buy" || lead.type === "rent") {
    // Buyer/renter: budget near or above market = good
    if (pct >= 10) {
      insights.push("Budget above market — strong buyer")
      return { score: 95, insights }
    }
    if (pct >= -5) {
      insights.push("Budget at market level — well positioned")
      return { score: 80, insights }
    }
    if (pct >= -15) {
      insights.push("Budget slightly below market")
      return { score: 55, insights }
    }
    insights.push("Budget significantly below market — likely to stall")
    return { score: 25, insights }
  } else {
    // Seller: asking price near or below market = realistic, converts faster
    if (pct <= -5) {
      insights.push("Asking price below market — will attract buyers fast")
      return { score: 90, insights }
    }
    if (pct <= 5) {
      insights.push("Asking price at market level")
      return { score: 75, insights }
    }
    if (pct <= 15) {
      insights.push("Asking price above market — may take longer")
      return { score: 50, insights }
    }
    insights.push("Asking price well above market — high risk of stalling")
    return { score: 20, insights }
  }
}

/** Engagement signals — preferred contact method, WhatsApp availability */
function engagementScore(lead: LeadScoreInput): { score: number; insights: string[] } {
  let score = 40 // baseline
  const insights: string[] = []

  // WhatsApp preferred = high engagement signal in Dubai market
  if (lead.preferredContact === "whatsapp" && lead.whatsapp) {
    score += 30
    insights.push("WhatsApp preferred — high engagement likelihood")
  } else if (lead.preferredContact === "phone" && lead.phone) {
    score += 20
  } else if (lead.preferredContact === "email") {
    score += 10
    insights.push("Email-only preference — slower conversion cycle")
  }

  // Multiple contact channels = more serious
  const channels = [lead.phone, lead.email, lead.whatsapp].filter(Boolean).length
  if (channels >= 3) {
    score += 20
    insights.push("All contact channels provided — serious lead")
  } else if (channels >= 2) {
    score += 10
  }

  // Detailed notes suggest motivated lead
  if (lead.notes && lead.notes.length > 50) {
    score += 10
  }

  return { score: Math.min(100, score), insights }
}

/** Area strength — based on historical conversion rates */
function areaStrengthScore(lead: LeadScoreInput): { score: number; insights: string[] } {
  const insights: string[] = []

  // If we have actual conversion data, use it
  if (lead.areaConversionRate !== undefined) {
    const rate = lead.areaConversionRate
    if (rate > 30) insights.push(`${lead.area} has high conversion rate (${rate}%)`)
    else if (rate < 10) insights.push(`${lead.area} has low conversion rate (${rate}%)`)
    return { score: Math.min(100, Math.round(rate * 2.5)), insights }
  }

  // Fallback: premium areas in Dubai tend to convert better
  const premiumAreas = [
    "palm jumeirah", "emirates hills", "downtown dubai", "dubai hills",
    "tilal al ghaf", "jumeirah golf estates",
  ]
  const midTierAreas = [
    "dubai marina", "jbr", "business bay", "arabian ranches",
    "al furjan", "damac hills",
  ]

  if (!lead.area) return { score: 40, insights: [] }

  const areaNorm = lead.area.toLowerCase()
  if (premiumAreas.some(a => areaNorm.includes(a))) {
    insights.push(`${lead.area} is a premium area — higher deal values`)
    return { score: 80, insights }
  }
  if (midTierAreas.some(a => areaNorm.includes(a))) {
    return { score: 60, insights }
  }

  return { score: 45, insights }
}

/** Recency — newer leads are more likely to convert */
function recencyScore(lead: LeadScoreInput): { score: number; insights: string[] } {
  const insights: string[] = []
  const now = Date.now()
  const created = new Date(lead.createdAt).getTime()
  const updated = new Date(lead.updatedAt).getTime()

  // Use most recent activity
  const lastActivity = Math.max(created, updated)
  const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24)

  if (daysSinceActivity <= 1) return { score: 100, insights: ["New lead — act fast"] }
  if (daysSinceActivity <= 3) return { score: 90, insights: ["Active within 3 days"] }
  if (daysSinceActivity <= 7) return { score: 75, insights }
  if (daysSinceActivity <= 14) return { score: 55, insights }
  if (daysSinceActivity <= 30) {
    insights.push("No activity in 2+ weeks — follow up needed")
    return { score: 35, insights }
  }

  insights.push(`Stale lead (${Math.round(daysSinceActivity)} days) — re-engage or deprioritize`)
  return { score: Math.max(5, 30 - Math.round(daysSinceActivity / 7)), insights }
}

// ── Main scoring function ───────────────────────────────────────────

export function scoreLeadConversion(lead: LeadScoreInput): LeadScoreResult {
  const comp = completenessScore(lead)
  const budget = budgetFitScore(lead)
  const engage = engagementScore(lead)
  const area = areaStrengthScore(lead)
  const recency = recencyScore(lead)

  const breakdown = {
    completeness: comp.score,
    budgetFit: budget.score,
    engagement: engage.score,
    areaStrength: area.score,
    recency: recency.score,
  }

  const score = Math.round(
    breakdown.completeness * WEIGHTS.completeness +
    breakdown.budgetFit * WEIGHTS.budgetFit +
    breakdown.engagement * WEIGHTS.engagement +
    breakdown.areaStrength * WEIGHTS.areaStrength +
    breakdown.recency * WEIGHTS.recency
  )

  const tier: LeadScoreResult["tier"] =
    score >= TIER_HOT ? "hot" : score >= TIER_WARM ? "warm" : "cold"

  // Collect top insights (max 4)
  const allInsights = [
    ...comp.insights,
    ...budget.insights,
    ...engage.insights,
    ...area.insights,
    ...recency.insights,
  ].slice(0, 4)

  return { score, tier, breakdown, insights: allInsights }
}

/**
 * Batch-score and rank an array of opportunities.
 * Returns them sorted by score descending.
 */
export function rankLeads(leads: LeadScoreInput[]): (LeadScoreInput & { leadScore: LeadScoreResult })[] {
  return leads
    .map(lead => ({ ...lead, leadScore: scoreLeadConversion(lead) }))
    .sort((a, b) => b.leadScore.score - a.leadScore.score)
}
