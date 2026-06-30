import { type ExchangeRequest } from "@/lib/data/exchange-data"

/**
 * Property matching engine — scores listings against a search request
 * on four dimensions: area, property type, price/budget, and features.
 */

export interface MatchCriteria {
  area: string
  propertyType: string
  transactionType: "buy" | "rent"
  minBedrooms: number
  maxBudget: number
  features: string[]
}

export interface MatchResult {
  listing: ExchangeRequest
  totalScore: number
  breakdown: {
    area: number
    type: number
    price: number
    features: number
  }
}

// Normalised area names for fuzzy matching
const AREA_ALIASES: Record<string, string[]> = {
  "palm jumeirah": ["palm", "palm j", "the palm"],
  "dubai marina": ["marina", "dmarina"],
  "downtown dubai": ["downtown", "dt", "burj khalifa district"],
  "emirates hills": ["eh", "emirates"],
  "arabian ranches": ["ar", "ranches"],
  "tilal al ghaf": ["tag", "tilal"],
  "business bay": ["bb", "bay"],
  "jbr": ["jumeirah beach residence", "the walk"],
  "jumeirah golf estates": ["jge", "golf estates"],
  "al furjan": ["furjan"],
  "damac hills": ["damac", "dh"],
  "dubai hills": ["dh estate", "dubai hills estate"],
}

function normalise(s: string): string {
  return s.toLowerCase().trim()
}

function areaScore(requestArea: string, listingArea: string): number {
  const reqNorm = normalise(requestArea)
  const listNorm = normalise(listingArea)

  // Exact match
  if (reqNorm === listNorm) return 100

  // Substring match
  if (listNorm.includes(reqNorm) || reqNorm.includes(listNorm)) return 90

  // Alias match
  for (const [canonical, aliases] of Object.entries(AREA_ALIASES)) {
    const allNames = [canonical, ...aliases]
    const reqMatch = allNames.some((a) => reqNorm.includes(a) || a.includes(reqNorm))
    const listMatch = allNames.some((a) => listNorm.includes(a) || a.includes(listNorm))
    if (reqMatch && listMatch) return 85
  }

  return 0
}

function typeScore(
  requestTransaction: "buy" | "rent",
  requestPropertyType: string,
  listing: ExchangeRequest
): number {
  let score = 0

  // Transaction type alignment (buy↔sell, rent↔lease)
  const txMatch =
    (requestTransaction === "buy" && listing.type === "sell") ||
    (requestTransaction === "rent" && listing.type === "lease")
  if (txMatch) score += 50

  // Property type match
  if (normalise(listing.propertyType) === normalise(requestPropertyType)) {
    score += 50
  } else {
    // Partial match for similar types
    const similar: Record<string, string[]> = {
      apartment: ["penthouse"],
      villa: ["townhouse"],
      townhouse: ["villa"],
      penthouse: ["apartment"],
    }
    const reqType = normalise(requestPropertyType)
    if (similar[reqType]?.includes(normalise(listing.propertyType))) {
      score += 20
    }
  }

  return score
}

function priceScore(maxBudget: number, listing: ExchangeRequest): number {
  if (maxBudget <= 0) return 50 // No budget specified → neutral

  const listingPrice = listing.minBudget

  // Within budget
  if (listingPrice <= maxBudget) {
    // Closer to budget = better (not too cheap)
    const ratio = listingPrice / maxBudget
    if (ratio >= 0.7) return 100
    if (ratio >= 0.4) return 80
    return 60
  }

  // Over budget
  const overRatio = listingPrice / maxBudget
  if (overRatio <= 1.1) return 70 // 10% over
  if (overRatio <= 1.25) return 40 // 25% over
  return 10
}

function featureScore(
  requestFeatures: string[],
  minBedrooms: number,
  listing: ExchangeRequest
): number {
  let score = 0
  let maxScore = 0

  // Bedrooms match (worth 60 of 100)
  maxScore += 60
  if (listing.bedrooms >= minBedrooms) {
    score += 60
  } else if (listing.bedrooms >= minBedrooms - 1) {
    score += 35
  }

  // Feature keyword overlap (worth 40 of 100)
  if (requestFeatures.length > 0) {
    maxScore += 40
    const listingFeatures = listing.features.map(normalise)
    let matched = 0
    for (const f of requestFeatures) {
      const fNorm = normalise(f)
      if (listingFeatures.some((lf) => lf.includes(fNorm) || fNorm.includes(lf))) {
        matched++
      }
    }
    score += Math.round((matched / requestFeatures.length) * 40)
  } else {
    maxScore += 40
    score += 20 // neutral if no features specified
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50
}

/**
 * Weights for each dimension (must sum to 1.0)
 */
const WEIGHTS = {
  area: 0.30,
  type: 0.25,
  price: 0.25,
  features: 0.20,
}

/**
 * Main scoring function — returns 0..100
 */
export function scoreMatch(criteria: MatchCriteria, listing: ExchangeRequest): MatchResult {
  const breakdown = {
    area: areaScore(criteria.area, listing.area),
    type: typeScore(criteria.transactionType, criteria.propertyType, listing),
    price: priceScore(criteria.maxBudget, listing),
    features: featureScore(criteria.features, criteria.minBedrooms, listing),
  }

  const totalScore = Math.round(
    breakdown.area * WEIGHTS.area +
    breakdown.type * WEIGHTS.type +
    breakdown.price * WEIGHTS.price +
    breakdown.features * WEIGHTS.features
  )

  return { listing, totalScore, breakdown }
}

/**
 * Match a criteria against all listings, sorted by score descending.
 * Only returns matches above the threshold (default 25).
 */
export function findMatches(
  criteria: MatchCriteria,
  listings: ExchangeRequest[],
  threshold = 25
): MatchResult[] {
  return listings
    .map((listing) => scoreMatch(criteria, listing))
    .filter((m) => m.totalScore >= threshold)
    .sort((a, b) => b.totalScore - a.totalScore)
}
