import { z } from "zod"

export const ListingSchema = z.object({
  source: z.literal("bayut").default("bayut"),
  community: z.string().min(1),
  master_community: z.string().optional().default(""),
  listing_number: z.string().default(""),
  permit_number: z.string().default(""),
  title: z.string().default(""),
  price: z.number().nullable().default(null),
  currency: z.string().default("AED"),
  rent_period: z.string().default(""),
  location: z.string().default(""),
  beds: z.number().nullable().default(null),
  baths: z.number().nullable().default(null),
  size_sqft: z.number().nullable().default(null),
  built_up_sqft: z.number().nullable().default(null),
  plot_sqft: z.number().nullable().default(null),
  sub_area: z.string().default(""),
  property_type: z.string().default(""),
  agency: z.string().default(""),
  agent_name: z.string().default(""),
  listing_url: z.string().default(""),
  page_url: z.string().default(""),
  transaction_type: z.enum(["rent", "sale"]).default("rent"),
  first_seen: z.string().default(""),
  last_seen: z.string().default(""),
  status: z.enum(["active", "not_seen", "blocked"]).default("active"),
  notes: z.string().default(""),
  raw_summary: z.string().default(""),
  import_id: z.string().default(""),
})

export type Listing = z.infer<typeof ListingSchema>

export interface InputLink {
  community: string
  url: string
  kind?: string
  areaId?: string
  masterCommunity?: string
}

export interface RunSummary {
  total_search_urls: number
  total_listings_found: number
  new_count: number
  updated_count: number
  not_seen_count: number
  blocked_urls: string[]
  error_count: number
  transactions_saved: number
}

export interface DetailExtractionResult {
  listing_number: string
  permit_number: string
  agency: string
  agent_name: string
  property_type: string
  beds?: number | null
  blocked: boolean
}

export interface DbListingRow {
  id: string
  listing_url: string
  listing_number: string
  permit_number: string
  community: string
  status: string
  price: number | null
  title: string
  location: string
  beds: number | null
  baths: number | null
  size_sqft: number | null
  property_type: string
  agency: string
  agent_name: string
  page_url: string
  transaction_type: string
  first_seen: string
  last_seen: string
  import_id: string
  notes: string
  raw_summary: Record<string, unknown> | string
}
