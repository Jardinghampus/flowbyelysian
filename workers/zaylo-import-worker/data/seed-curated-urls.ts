/**
 * Seed zaylo_areas + zaylo_source_links from curated Bayut community trees.
 * Usage (from worker dir): npm run seed-urls
 */
import { config as loadEnv } from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { generateCuratedUrls } from "./bayut-communities.js"

const here = path.dirname(fileURLToPath(import.meta.url))
const workerRoot = path.resolve(here, "..")
const repoRoot = path.resolve(workerRoot, "../..")
loadEnv({ path: path.join(repoRoot, ".env.zaylo.local") })
loadEnv({ path: path.join(repoRoot, ".env.local") })
loadEnv({ path: path.join(repoRoot, ".env") })
loadEnv({ path: path.join(workerRoot, ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const rows = generateCuratedUrls()

async function main() {
  const areaMap = new Map<string, { slug: string; master: string; community: string; sub: string; path: string }>()

  for (const row of rows) {
    if (!areaMap.has(row.areaSlug)) {
      areaMap.set(row.areaSlug, {
        slug: row.areaSlug,
        master: row.community,
        community: row.community,
        sub: row.area,
        path: row.bayutPath,
      })
    }
  }

  console.log(`Upserting ${areaMap.size} areas from ${rows.length} curated URLs…`)
  const areaPayload = Array.from(areaMap.values()).map((area) => ({
    slug: area.slug,
    master_community: area.master,
    community: area.community,
    sub_community: area.sub,
    bayut_path: area.path,
    active: true,
    updated_at: new Date().toISOString(),
  }))

  for (let i = 0; i < areaPayload.length; i += 50) {
    const chunk = areaPayload.slice(i, i + 50)
    const { error } = await supabase.from("zaylo_areas").upsert(chunk, { onConflict: "slug" })
    if (error) throw new Error(`area upsert: ${error.message}`)
  }

  const { data: areas, error: areasErr } = await supabase
    .from("zaylo_areas")
    .select("id, slug")
    .in("slug", Array.from(areaMap.keys()))

  if (areasErr) throw areasErr
  const idBySlug = new Map((areas || []).map((a) => [a.slug as string, a.id as string]))

  console.log(`Upserting source links…`)
  let inserted = 0
  let updated = 0

  for (let i = 0; i < rows.length; i += 40) {
    const chunk = rows.slice(i, i + 40)
    for (const row of chunk) {
      const areaId = idBySlug.get(row.areaSlug)
      if (!areaId) {
        console.warn("missing area id", row.areaSlug)
        continue
      }
      const kind = row.purpose === "sale" ? "bayut_sale_listings" : "bayut_rent_listings"
      const label = `${row.area} ${row.purpose} ${row.propertyType}`

      const { data: existing } = await supabase
        .from("zaylo_source_links")
        .select("id")
        .eq("url", row.url)
        .maybeSingle()

      if (existing?.id) {
        const { error } = await supabase
          .from("zaylo_source_links")
          .update({ active: true, area_id: areaId, kind, label, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
        if (error) console.error("link update", error.message)
        else updated += 1
      } else {
        const { error } = await supabase.from("zaylo_source_links").insert({
          area_id: areaId,
          kind,
          label,
          url: row.url,
          active: true,
        })
        if (error) console.error("link insert", row.url, error.message)
        else inserted += 1
      }
    }
    process.stdout.write(`\r  processed ${Math.min(i + 40, rows.length)}/${rows.length}`)
  }

  console.log(`\nDone. inserted=${inserted} updated=${updated}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
