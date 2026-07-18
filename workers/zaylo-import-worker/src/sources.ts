import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "csv-parse/sync"
import { z } from "zod"
import { config } from "./config.js"
import { loadActiveSourceLinks } from "./db.js"
import type { InputLink } from "./types.js"
import { inferTransactionType, masterFromCommunity } from "./utils.js"

const InputLinkSchema = z.object({
  community: z.string().min(1),
  url: z.string().url(),
})

const workerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

export async function resolveInputLinks(): Promise<InputLink[]> {
  let links: InputLink[] = []

  try {
    const fromDb = await loadActiveSourceLinks()
    const listingLinks = fromDb.filter((l) => l.kind.includes("listings") || l.kind.includes("transactions"))
    if (listingLinks.length > 0) {
      links = listingLinks.map((l) => ({
        community: l.community,
        url: l.url,
        kind: l.kind,
        areaId: l.areaId,
        masterCommunity: l.masterCommunity,
      }))
    }
  } catch (error) {
    console.warn("Could not load source links from Supabase, falling back to CSV:", error)
  }

  if (links.length === 0) {
    const csvPath = path.isAbsolute(config.INPUT_LINKS_CSV)
      ? config.INPUT_LINKS_CSV
      : path.join(workerRoot, config.INPUT_LINKS_CSV)
    const csv = await readFile(csvPath, "utf8")
    const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as unknown[]

    links = rows.map((row, index) => {
      const parsed = InputLinkSchema.safeParse(row)
      if (!parsed.success) throw new Error(`Invalid input_links.csv row ${index + 2}: ${parsed.error.message}`)
      return {
        ...parsed.data,
        kind: inferTransactionType(parsed.data.url) === "sale" ? "bayut_sale_listings" : "bayut_rent_listings",
        masterCommunity: masterFromCommunity(parsed.data.community),
      }
    })
  }

  if (config.PREFER_CURATED_URLS) {
    const curated = links.filter((l) => /\/(villas|townhouses|apartments|property)\//i.test(l.url))
    if (curated.length > 0) {
      links = curated
      console.log(`Using ${links.length} curated listing URLs`)
    }
  }

  // Prefer listings over transactions; stable order by community then url
  links = links
    .filter((l) => !l.kind.includes("transactions"))
    .sort((a, b) => a.community.localeCompare(b.community) || a.url.localeCompare(b.url))

  const includes = (process.env.SOURCE_URL_INCLUDES || "").trim().toLowerCase()
  if (includes) {
    links = links.filter(
      (l) =>
        l.url.toLowerCase().includes(includes) ||
        l.community.toLowerCase().includes(includes) ||
        (l.masterCommunity || "").toLowerCase().includes(includes)
    )
    console.log(`SOURCE_URL_INCLUDES=${includes} → ${links.length} listing URL(s)`)
  }

  if (config.MAX_SOURCE_LINKS > 0 && links.length > 0 && links.length > config.MAX_SOURCE_LINKS) {
    console.log(`MAX_SOURCE_LINKS=${config.MAX_SOURCE_LINKS} — truncating from ${links.length}`)
    links = links.slice(0, config.MAX_SOURCE_LINKS)
  }

  return links
}
