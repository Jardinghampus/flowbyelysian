import { createServerClient } from "@/lib/supabase/server"
import { zayloAreaCatalog, zayloSourceLinks, type ZayloAreaCatalogItem, type ZayloSourceKind, type ZayloSourceLink } from "@/lib/zaylo/market-catalog"
import { marketMetrics, socialDrafts, type MarketMetric } from "@/lib/zaylo/market-studio"

export type MarketStudioState = {
  areas: ZayloAreaCatalogItem[]
  sourceLinks: ZayloSourceLink[]
  metrics: MarketMetric[]
  drafts: typeof socialDrafts
  dataMode: "supabase" | "seed"
  warnings: string[]
}

type ZayloAreaRow = {
  slug: string
  city: "Dubai"
  master_community: string
  community: string
  sub_community: string
  bayut_path: string | null
  property_types: Array<"Villa" | "Townhouse">
  bedrooms: Array<3 | 4 | 5>
  active: boolean
}

type ZayloSourceLinkRow = {
  id: string
  area_slug?: string
  area_id?: string
  kind: ZayloSourceKind
  label: string
  url: string
  active: boolean
  notes: string | null
  zaylo_areas?: { slug?: string } | null
}

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function rowToArea(row: ZayloAreaRow): ZayloAreaCatalogItem {
  return {
    id: row.slug,
    city: row.city,
    masterCommunity: row.master_community,
    community: row.community,
    subCommunity: row.sub_community,
    bayutPath: row.bayut_path ?? "",
    propertyTypes: row.property_types,
    bedrooms: row.bedrooms,
    active: row.active,
  }
}

function rowToSourceLink(row: ZayloSourceLinkRow): ZayloSourceLink {
  return {
    id: row.id,
    areaId: row.zaylo_areas?.slug ?? row.area_slug ?? row.area_id ?? "",
    kind: row.kind,
    label: row.label,
    url: row.url,
    active: row.active,
    notes: row.notes ?? undefined,
  }
}

export async function getMarketStudioState(): Promise<MarketStudioState> {
  if (!hasSupabaseEnv()) {
    return {
      areas: zayloAreaCatalog,
      sourceLinks: zayloSourceLinks,
      metrics: marketMetrics,
      drafts: socialDrafts,
      dataMode: "seed",
      warnings: ["Supabase is not configured. Using seed catalog and read-only source links."],
    }
  }

  try {
    const supabase = createServerClient()
    const [{ data: areaRows, error: areaError }, { data: sourceRows, error: sourceError }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("zaylo_areas").select("*").eq("active", true).order("master_community"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("zaylo_source_links")
        .select("id, kind, label, url, active, notes, zaylo_areas(slug)")
        .order("created_at", { ascending: false }),
    ])

    if (areaError || sourceError) {
      throw areaError ?? sourceError
    }

    const areas = ((areaRows ?? []) as ZayloAreaRow[]).map(rowToArea)
    const sourceLinks = ((sourceRows ?? []) as ZayloSourceLinkRow[]).map(rowToSourceLink)

    return {
      areas: areas.length ? areas : zayloAreaCatalog,
      sourceLinks: sourceLinks.length ? sourceLinks : zayloSourceLinks,
      metrics: marketMetrics,
      drafts: socialDrafts,
      dataMode: areas.length ? "supabase" : "seed",
      warnings: areas.length ? [] : ["Supabase is connected, but Zaylo tables are empty. Using seed catalog."],
    }
  } catch (error) {
    console.warn("Zaylo Market Studio Supabase read failed; using seed catalog.", error)
    return {
      areas: zayloAreaCatalog,
      sourceLinks: zayloSourceLinks,
      metrics: marketMetrics,
      drafts: socialDrafts,
      dataMode: "seed",
      warnings: ["Supabase Zaylo tables are not ready. Using seed catalog."],
    }
  }
}

export async function createZayloSourceLink(input: {
  areaSlug: string
  kind: ZayloSourceKind
  label: string
  url: string
}) {
  if (!hasSupabaseEnv()) {
    return { ok: false, status: 409, error: "Supabase is not configured yet." }
  }

  try {
    const supabase = createServerClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: area, error: areaError } = await (supabase as any)
      .from("zaylo_areas")
      .select("id")
      .eq("slug", input.areaSlug)
      .single()

    if (areaError || !area?.id) {
      return { ok: false, status: 404, error: "Area is not seeded in Supabase yet." }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("zaylo_source_links")
      .insert({
        area_id: area.id,
        kind: input.kind,
        label: input.label,
        url: input.url,
        active: true,
        notes: "Created from CRM Market Studio.",
      })
      .select("id, kind, label, url, active, notes, zaylo_areas(slug)")
      .single()

    if (error) throw error
    return { ok: true, status: 201, sourceLink: rowToSourceLink(data as ZayloSourceLinkRow) }
  } catch (error) {
    console.error("Failed to create Zaylo source link:", error)
    return { ok: false, status: 500, error: "Failed to create source link." }
  }
}
