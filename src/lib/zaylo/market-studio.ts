import { zayloAreaCatalog, zayloSourceLinks, type ZayloBedroom } from "./market-catalog"

export type MarketMetricStatus = "live" | "manual" | "draft" | "needs_data"

export type MarketMetric = {
  id: string
  community: string
  subCommunity: string
  beds: ZayloBedroom
  propertyType: "Villa" | "Townhouse"
  rentalAvgAed: number | null
  saleAvgAed: number | null
  rentSampleSize: number
  saleSampleSize: number
  pricePerSqftAed: number | null
  sourceLabel: string
  sourceUrl?: string
  updatedAt: string
  status: MarketMetricStatus
  notes?: string
}

export type SocialPostDraft = {
  id: string
  metricId: string
  format: "1350x1080"
  hook: string
  headline: string
  body: string
  caption: string
  trustLine: string
  cta: string
}

const generatedAt = "2026-06-30T00:00:00.000Z"

const planningBaselines: MarketMetric[] = [
  {
    id: "mudon-al-ranim-3br-townhouse",
    community: "Mudon",
    subCommunity: "Al Ranim",
    beds: 3,
    propertyType: "Townhouse",
    rentalAvgAed: 195000,
    saleAvgAed: 3800000,
    rentSampleSize: 0,
    saleSampleSize: 0,
    pricePerSqftAed: null,
    sourceLabel: "Planning baseline",
    sourceUrl: "https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/al-ranim/",
    updatedAt: generatedAt,
    status: "draft",
    notes: "Draft baseline. Replace with Bayut Transactions/DXB Interact median before publishing.",
  },
  {
    id: "mudon-al-ranim-4br-townhouse",
    community: "Mudon",
    subCommunity: "Al Ranim",
    beds: 4,
    propertyType: "Townhouse",
    rentalAvgAed: null,
    saleAvgAed: null,
    rentSampleSize: 0,
    saleSampleSize: 0,
    pricePerSqftAed: null,
    sourceLabel: "Needs transaction import",
    sourceUrl: "https://www.bayut.com/property-market-analysis/transactions/sale/property/dubai/mudon/al-ranim/",
    updatedAt: generatedAt,
    status: "needs_data",
    notes: "Waiting for transaction source import.",
  },
  {
    id: "mudon-arabella-3br-townhouse",
    community: "Mudon",
    subCommunity: "Arabella",
    beds: 3,
    propertyType: "Townhouse",
    rentalAvgAed: null,
    saleAvgAed: null,
    rentSampleSize: 0,
    saleSampleSize: 0,
    pricePerSqftAed: null,
    sourceLabel: "Needs transaction import",
    sourceUrl: "https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/arabella/",
    updatedAt: generatedAt,
    status: "needs_data",
  },
  {
    id: "mudon-rahat-4br-villa",
    community: "Mudon",
    subCommunity: "Rahat",
    beds: 4,
    propertyType: "Villa",
    rentalAvgAed: null,
    saleAvgAed: null,
    rentSampleSize: 0,
    saleSampleSize: 0,
    pricePerSqftAed: null,
    sourceLabel: "Needs transaction import",
    sourceUrl: "https://www.bayut.com/property-market-analysis/transactions/rent/property/dubai/mudon/rahat/",
    updatedAt: generatedAt,
    status: "needs_data",
  },
]

const planningBaselineById = new Map(planningBaselines.map((metric) => [metric.id, metric]))

export const marketMetrics: MarketMetric[] = zayloAreaCatalog.flatMap((area) =>
  area.propertyTypes.flatMap((propertyType) =>
    area.bedrooms.map((beds) => {
      const id = `${area.id}-${beds}br-${propertyType.toLowerCase()}`
      const baseline = planningBaselineById.get(id)

      if (baseline) return baseline

      return {
        id,
        community: area.community,
        subCommunity: area.subCommunity,
        beds,
        propertyType,
        rentalAvgAed: null,
        saleAvgAed: null,
        rentSampleSize: 0,
        saleSampleSize: 0,
        pricePerSqftAed: null,
        sourceLabel: "Needs source import",
        sourceUrl: zayloSourceLinks.find((link) => link.areaId === area.id && link.kind === "bayut_rent_transactions")?.url,
        updatedAt: generatedAt,
        status: "needs_data",
        notes: "Waiting for Bayut Transactions, DXB Interact, Firecrawl, scraper, or manual import data.",
      } satisfies MarketMetric
    })
  )
)

export function formatAed(value: number | null, compact = false): string {
  if (!value) return "Needs data"
  if (compact && value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (compact && value >= 1_000) return `AED ${Math.round(value / 1000)}K`
  return `AED ${new Intl.NumberFormat("en-AE").format(value)}`
}

export function createSocialDraft(metric: MarketMetric): SocialPostDraft {
  const area = `${metric.community}, ${metric.subCommunity}`
  const rent = formatAed(metric.rentalAvgAed, true)
  const sale = formatAed(metric.saleAvgAed, true)
  const dataWarning = metric.status === "live" || metric.status === "manual"
    ? `Based on ${metric.rentSampleSize + metric.saleSampleSize} visible market signals.`
    : "Draft only. Validate against Bayut Transactions/DXB Interact before posting."

  return {
    id: `${metric.id}-hormozi-frame`,
    metricId: metric.id,
    format: "1350x1080",
    hook: `${metric.beds}BR in ${metric.subCommunity}: what is the real number?`,
    headline: `${metric.beds}BR ${metric.propertyType.toLowerCase()} pulse`,
    body: `Rental avg: ${rent}\nSelling avg: ${sale}`,
    trustLine: dataWarning,
    cta: `DM "${metric.subCommunity}" and I will send the current range.`,
    caption: [
      `${area} ${metric.beds}BR ${metric.propertyType.toLowerCase()} pulse.`,
      `Rental average: ${rent}.`,
      `Selling average: ${sale}.`,
      dataWarning,
      "The edge is not guessing the headline number. It is knowing which layout, plot, street, and owner situation changes the deal.",
      `DM me "${metric.subCommunity}" if you want the latest range for your exact unit.`,
    ].join("\n\n"),
  }
}

export const socialDrafts = marketMetrics.map(createSocialDraft)
