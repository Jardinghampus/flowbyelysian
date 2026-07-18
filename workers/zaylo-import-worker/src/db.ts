import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { config } from "./config.js"
import type { DbListingRow, Listing } from "./types.js"
import { masterFromCommunity } from "./utils.js"

let client: SupabaseClient | null = null

export function getDb(): SupabaseClient {
  if (!client) {
    client = createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client
}

export async function createImportRun(jobType: string): Promise<string> {
  const { data, error } = await getDb()
    .from("zaylo_import_runs")
    .insert({
      job_type: jobType,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !data) throw new Error(`Failed to create import run: ${error?.message}`)
  return data.id as string
}

export async function finishImportRun(
  id: string,
  patch: {
    status: "completed" | "blocked" | "failed"
    total_sources: number
    total_rows: number
    blocked_urls: string[]
    error_count: number
    log?: string
  }
): Promise<void> {
  const { error } = await getDb()
    .from("zaylo_import_runs")
    .update({
      ...patch,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw new Error(`Failed to finish import run: ${error.message}`)
}

export async function loadActiveSourceLinks(): Promise<
  Array<{ community: string; url: string; kind: string; areaId: string; masterCommunity: string }>
> {
  const { data, error } = await getDb()
    .from("zaylo_source_links")
    .select("id, url, kind, active, area_id, zaylo_areas(slug, master_community, community, sub_community)")
    .eq("active", true)
    .in("kind", [
      "bayut_rent_listings",
      "bayut_sale_listings",
      "bayut_rent_transactions",
      "bayut_sale_transactions",
    ])

  if (error) throw new Error(`Failed to load source links: ${error.message}`)

  return (data || []).map((row) => {
    const area = Array.isArray(row.zaylo_areas) ? row.zaylo_areas[0] : row.zaylo_areas
    const community = area?.sub_community || area?.community || "Unknown"
    return {
      community,
      url: row.url as string,
      kind: row.kind as string,
      areaId: row.area_id as string,
      masterCommunity: area?.master_community || masterFromCommunity(community),
    }
  })
}

export async function markSourceStatus(
  url: string,
  status: "ready" | "blocked" | "error" | "empty"
): Promise<void> {
  await getDb()
    .from("zaylo_source_links")
    .update({ last_status: status, last_scraped_at: new Date().toISOString() })
    .eq("url", url)
}

export async function loadCommunityListings(community: string): Promise<DbListingRow[]> {
  const { data, error } = await getDb()
    .from("bayut_market_listings")
    .select("*")
    .eq("community", community)

  if (error) throw new Error(`Failed to load listings: ${error.message}`)
  return (data || []) as DbListingRow[]
}

function parseRawSummary(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}") as Record<string, unknown>
  } catch {
    return { text: raw }
  }
}

export async function upsertListing(listing: Listing, importRunId: string): Promise<"new" | "updated"> {
  const now = listing.last_seen || new Date().toISOString()
  const payload = {
    source: "bayut",
    community: listing.community,
    master_community: listing.master_community || masterFromCommunity(listing.community),
    listing_number: listing.listing_number || "",
    permit_number: listing.permit_number || "",
    title: listing.title || "",
    price: listing.price,
    currency: listing.currency || "AED",
    rent_period: listing.rent_period || "",
    location: listing.location || "",
    beds: listing.beds,
    baths: listing.baths,
    size_sqft: listing.built_up_sqft ?? listing.size_sqft,
    built_up_sqft: listing.built_up_sqft ?? listing.size_sqft,
    plot_sqft: listing.plot_sqft,
    sub_area: listing.sub_area || listing.location || listing.community,
    property_type: listing.property_type || "",
    agency: listing.agency || "",
    agent_name: listing.agent_name || "",
    listing_url: listing.listing_url,
    page_url: listing.page_url || "",
    transaction_type: listing.transaction_type,
    status: listing.status,
    last_seen: now,
    first_seen: listing.first_seen || now,
    import_run_id: importRunId,
    import_id: listing.import_id || "",
    notes: listing.notes || "",
    raw_summary: parseRawSummary(listing.raw_summary),
    updated_at: now,
  }

  const { data: existing } = await getDb()
    .from("bayut_market_listings")
    .select("id, first_seen")
    .eq("listing_url", listing.listing_url)
    .maybeSingle()

  if (existing) {
    // Don't wipe Regulatory Information filled by detail enrich
    const { data: prev } = await getDb()
      .from("bayut_market_listings")
      .select("permit_number, agency")
      .eq("id", existing.id)
      .maybeSingle()

    const merged = {
      ...payload,
      first_seen: existing.first_seen,
      permit_number: payload.permit_number || prev?.permit_number || "",
      agency: payload.agency || prev?.agency || "",
    }

    const { error } = await getDb().from("bayut_market_listings").update(merged).eq("id", existing.id)
    if (error) throw new Error(`Failed to update listing: ${error.message}`)
    return "updated"
  }

  const { error } = await getDb().from("bayut_market_listings").insert(payload)
  if (error) throw new Error(`Failed to insert listing: ${error.message}`)
  return "new"
}

export async function markNotSeen(
  community: string,
  seenUrls: Set<string>,
  now: string,
  importRunId: string,
  transactionType?: "rent" | "sale"
): Promise<number> {
  const rows = await loadCommunityListings(community)
  let count = 0
  for (const row of rows) {
    if (row.status !== "active") continue
    if (transactionType && row.transaction_type !== transactionType) continue
    if (seenUrls.has(row.listing_url)) continue

    const { error } = await getDb()
      .from("bayut_market_listings")
      .update({
        status: "not_seen",
        last_seen: now,
        import_run_id: importRunId,
        updated_at: now,
      })
      .eq("id", row.id)

    if (!error) count += 1
  }
  return count
}

export async function upsertTransactions(
  rows: Array<{
    community: string
    master_community: string
    sub_area?: string
    location?: string
    bedrooms: number | null
    property_type: string
    transaction_type: "rent" | "sale"
    price_aed: number | null
    size_sqft: number | null
    built_up_sqft?: number | null
    plot_sqft?: number | null
    price_per_sqft_aed: number | null
    transaction_date: string | null
    history?: string
    fingerprint?: string
    detail_url?: string
    source_url: string
    raw: Record<string, unknown>
  }>,
  importRunId: string
): Promise<number> {
  if (rows.length === 0) return 0
  let saved = 0
  for (const row of rows) {
    const fingerprint =
      row.fingerprint ||
      String(row.raw.fingerprint || "") ||
      [
        row.transaction_date || "",
        row.price_aed ?? "",
        row.bedrooms ?? "",
        row.built_up_sqft ?? row.size_sqft ?? "",
        row.plot_sqft ?? "",
        (row.location || "").toLowerCase(),
        row.transaction_type,
      ].join("|")

    const payload = {
      community: row.community,
      master_community: row.master_community,
      sub_area: row.sub_area || "",
      location: row.location || "",
      bedrooms: row.bedrooms,
      property_type: row.property_type,
      transaction_type: row.transaction_type,
      price_aed: row.price_aed,
      size_sqft: row.size_sqft,
      built_up_sqft: row.built_up_sqft ?? row.size_sqft,
      plot_sqft: row.plot_sqft ?? null,
      price_per_sqft_aed: row.price_per_sqft_aed,
      transaction_date: row.transaction_date,
      history: row.history || "",
      detail_url: row.detail_url || "",
      fingerprint,
      source_url: row.source_url,
      import_run_id: importRunId,
      raw: row.raw,
    }

    const { data: existing } = await getDb()
      .from("bayut_transactions")
      .select("id")
      .eq("fingerprint", fingerprint)
      .maybeSingle()

    if (existing?.id) {
      const { error } = await getDb().from("bayut_transactions").update(payload).eq("id", existing.id)
      if (!error) saved += 1
      else console.error("tx update failed", error.message)
    } else {
      const { error } = await getDb().from("bayut_transactions").insert(payload)
      if (!error) saved += 1
      else console.error("tx insert failed", error.message)
    }
  }
  return saved
}

/** @deprecated prefer upsertTransactions */
export async function insertTransactions(
  rows: Array<{
    community: string
    master_community: string
    bedrooms: number | null
    property_type: string
    transaction_type: "rent" | "sale"
    price_aed: number | null
    size_sqft: number | null
    price_per_sqft_aed: number | null
    transaction_date: string | null
    source_url: string
    raw: Record<string, unknown>
  }>,
  importRunId: string
): Promise<number> {
  return upsertTransactions(rows, importRunId)
}

export async function loadActiveListingsForMetrics() {
  const { data, error } = await getDb()
    .from("bayut_market_listings")
    .select("community, master_community, beds, property_type, price, size_sqft, transaction_type, status")
    .eq("status", "active")

  if (error) throw new Error(`Failed to load metrics source: ${error.message}`)
  return data || []
}

export async function upsertMetric(row: {
  community: string
  bedrooms: number
  property_type: string
  rental_avg_aed: number | null
  sale_avg_aed: number | null
  rent_sample_size: number
  sale_sample_size: number
  price_per_sqft_aed: number | null
}): Promise<string> {
  const { data: area } = await getDb()
    .from("zaylo_areas")
    .select("id")
    .or(`sub_community.eq.${row.community},community.eq.${row.community}`)
    .maybeSingle()

  const { data: existing } = await getDb()
    .from("zaylo_market_metrics")
    .select("id")
    .eq("community", row.community)
    .eq("bedrooms", row.bedrooms)
    .eq("property_type", row.property_type)
    .maybeSingle()

  const payload = {
    area_id: area?.id ?? null,
    community: row.community,
    bedrooms: row.bedrooms,
    property_type: row.property_type,
    rental_avg_aed: row.rental_avg_aed,
    sale_avg_aed: row.sale_avg_aed,
    rent_sample_size: row.rent_sample_size,
    sale_sample_size: row.sale_sample_size,
    price_per_sqft_aed: row.price_per_sqft_aed,
    data_status: "live" as const,
    confidence_score: Math.min(1, (row.rent_sample_size + row.sale_sample_size) / 20),
    source_summary: { source: "bayut_market_listings" },
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await getDb().from("zaylo_market_metrics").update(payload).eq("id", existing.id)
    return existing.id as string
  }

  const { data, error } = await getDb().from("zaylo_market_metrics").insert(payload).select("id").single()
  if (error || !data) throw new Error(`Failed to insert metric: ${error?.message}`)
  return data.id as string
}

export async function insertSocialPost(post: {
  metric_id: string
  area_id?: string | null
  hook: string
  headline: string
  body: string
  caption: string
  trust_line: string
  cta: string
}): Promise<void> {
  await getDb().from("zaylo_social_posts").insert({
    ...post,
    format: "1350x1080",
    status: "draft",
    narrative: "dubai_land_villa_expert",
  })
}

export async function loadLiveMetrics() {
  const { data, error } = await getDb()
    .from("zaylo_market_metrics")
    .select("*, zaylo_areas(id, sub_community, master_community)")
    .eq("data_status", "live")
    .order("generated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}
