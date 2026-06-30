// Market Updates — in-memory store shared across client components
// In production this would be backed by a database (Supabase, etc.)

export interface MarketUpdate {
  id: string
  title: string
  body: string
  excerpt: string
  imageUrl: string | null
  tags: string[]
  status: "draft" | "published" | "scheduled"
  publishedAt: string | null   // ISO date
  scheduledAt: string | null   // ISO date
  createdAt: string            // ISO date
  updatedAt: string            // ISO date
  author: string
}

// ── Seed data ────────────────────────────────────────────────────────

const SEED_UPDATES: MarketUpdate[] = [
  {
    id: "mu-1",
    title: "Dubai Marina Rental Yields Reach 7.2% — Highest in 5 Years",
    body: `Dubai Marina continues to attract investors with rental yields climbing to 7.2% in Q1 2026, according to the latest data from the Dubai Land Department.\n\nThe surge is driven by strong demand from expatriates relocating to Dubai, coupled with limited new supply in the established waterfront community. Studios and one-bedroom apartments are seeing the highest demand, with average rents increasing 12% year-over-year.\n\n**Key takeaways:**\n- Average studio rent: AED 65,000/year (+14% YoY)\n- Average 1BR rent: AED 95,000/year (+12% YoY)\n- Average 2BR rent: AED 140,000/year (+9% YoY)\n- Occupancy rates: 94%\n\nExperts recommend investors consider units below the AED 1.5M price point for optimal yield-to-price ratios.`,
    excerpt: "Rental yields in Dubai Marina reach their highest level in five years, driven by strong expatriate demand and limited supply.",
    imageUrl: null,
    tags: ["Dubai Marina", "Rental Yields", "Investment"],
    status: "published",
    publishedAt: "2026-03-10T09:00:00Z",
    scheduledAt: null,
    createdAt: "2026-03-09T14:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    author: "Zaylo Research",
  },
  {
    id: "mu-2",
    title: "New Golden Visa Rules: What Property Buyers Need to Know",
    body: `The UAE government has announced updated Golden Visa requirements for property investors, effective April 2026.\n\n**What changed:**\n- Minimum property value for a 10-year visa reduced to AED 1.5M (from AED 2M)\n- Off-plan purchases now qualify if the developer is government-approved\n- Joint ownership between spouses is now accepted\n- Processing time reduced to 15 business days\n\n**Impact on the market:**\nIndustry analysts expect these changes to drive a 15-20% increase in transaction volume among mid-market investors, particularly in areas like JVC, Dubai Hills Estate, and Town Square.\n\nIf you are looking to purchase a property that qualifies for the Golden Visa, our team can guide you through eligible listings in your preferred communities.`,
    excerpt: "Updated Golden Visa requirements lower the property investment threshold to AED 1.5M and accept off-plan purchases.",
    imageUrl: null,
    tags: ["Golden Visa", "Regulations", "Investment"],
    status: "published",
    publishedAt: "2026-03-05T10:00:00Z",
    scheduledAt: null,
    createdAt: "2026-03-04T16:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
    author: "Zaylo Research",
  },
  {
    id: "mu-3",
    title: "Palm Jumeirah Prices Stabilise After 18-Month Rally",
    body: `After an 18-month upward trajectory, property prices on Palm Jumeirah are showing signs of stabilisation, according to Q1 2026 transaction data.\n\nAverage prices per square foot have plateaued at AED 3,200 for apartments and AED 4,800 for villas, suggesting the market may be entering a consolidation phase.\n\n**Market signals:**\n- Days on market increased from 28 to 42 days\n- Seller asking prices remain firm\n- Buyer negotiation margins widened to 5-7%\n- New inventory from handovers expected in Q3 2026\n\nThis could present opportunities for buyers who have been waiting for a leveling-off before entering the Palm market.`,
    excerpt: "Palm Jumeirah prices plateau after 18 months of growth, with days on market increasing and buyer negotiation margins widening.",
    imageUrl: null,
    tags: ["Palm Jumeirah", "Market Trends", "Pricing"],
    status: "published",
    publishedAt: "2026-02-28T08:30:00Z",
    scheduledAt: null,
    createdAt: "2026-02-27T12:00:00Z",
    updatedAt: "2026-02-28T08:30:00Z",
    author: "Zaylo Research",
  },
  {
    id: "mu-4",
    title: "Off-Plan Launch: Emaar's Creek Horizon — Early Access Pricing",
    body: `Emaar has announced Creek Horizon, a new waterfront development in Dubai Creek Harbour with expected handover in Q4 2028.\n\n**Project highlights:**\n- 1BR from AED 1.2M, 2BR from AED 1.9M, 3BR from AED 2.8M\n- 60/40 payment plan (60% during construction, 40% on handover)\n- Full creek and Burj Khalifa views from upper floors\n- Direct access to Creek Beach and retail promenade\n\nEarly-bird pricing is available until March 31, 2026. Contact us if you'd like to receive the floor plans and payment schedule.`,
    excerpt: "Emaar launches Creek Horizon in Dubai Creek Harbour with early-bird pricing starting from AED 1.2M for 1BR units.",
    imageUrl: null,
    tags: ["Off-Plan", "Emaar", "Dubai Creek Harbour", "New Launch"],
    status: "published",
    publishedAt: "2026-02-20T07:00:00Z",
    scheduledAt: null,
    createdAt: "2026-02-19T15:00:00Z",
    updatedAt: "2026-02-20T07:00:00Z",
    author: "Zaylo Research",
  },
  {
    id: "mu-5",
    title: "Upcoming: Q2 2026 Dubai Real Estate Forecast",
    body: `Our quarterly market forecast for Q2 2026 is currently in preparation. Topics covered will include:\n\n- Transaction volume trends\n- Price movement across key communities\n- Rental market outlook\n- Off-plan vs. ready market dynamics\n- Impact of new regulations\n\nStay tuned — this report will be published on April 1, 2026.`,
    excerpt: "Our comprehensive Q2 2026 market forecast is in preparation and will cover pricing, rental yields, and regulatory impacts.",
    imageUrl: null,
    tags: ["Forecast", "Market Trends"],
    status: "scheduled",
    scheduledAt: "2026-04-01T09:00:00Z",
    publishedAt: null,
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
    author: "Zaylo Research",
  },
]

// ── In-memory store (singleton) ──────────────────────────────────────

let updates: MarketUpdate[] = [...SEED_UPDATES]
let listeners: Array<() => void> = []

function notify() {
  listeners.forEach((l) => l())
}

export const marketUpdatesStore = {
  getAll(): MarketUpdate[] {
    return updates
  },

  getPublished(): MarketUpdate[] {
    return updates
      .filter((u) => u.status === "published")
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
  },

  getById(id: string): MarketUpdate | undefined {
    return updates.find((u) => u.id === id)
  },

  create(data: Omit<MarketUpdate, "id" | "createdAt" | "updatedAt">): MarketUpdate {
    const now = new Date().toISOString()
    const update: MarketUpdate = {
      ...data,
      id: `mu-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    updates = [update, ...updates]
    notify()
    return update
  },

  update(id: string, data: Partial<Omit<MarketUpdate, "id" | "createdAt">>): MarketUpdate | null {
    const idx = updates.findIndex((u) => u.id === id)
    if (idx === -1) return null
    updates[idx] = { ...updates[idx], ...data, updatedAt: new Date().toISOString() }
    notify()
    return updates[idx]
  },

  delete(id: string): boolean {
    const before = updates.length
    updates = updates.filter((u) => u.id !== id)
    if (updates.length < before) {
      notify()
      return true
    }
    return false
  },

  subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
}
