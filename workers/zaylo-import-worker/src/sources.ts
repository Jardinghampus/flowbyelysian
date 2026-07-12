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
  try {
    const fromDb = await loadActiveSourceLinks()
    const listingLinks = fromDb.filter((l) => l.kind.includes("listings") || l.kind.includes("transactions"))
    if (listingLinks.length > 0) {
      return listingLinks.map((l) => ({
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

  const csvPath = path.isAbsolute(config.INPUT_LINKS_CSV)
    ? config.INPUT_LINKS_CSV
    : path.join(workerRoot, config.INPUT_LINKS_CSV)
  const csv = await readFile(csvPath, "utf8")
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as unknown[]

  return rows.map((row, index) => {
    const parsed = InputLinkSchema.safeParse(row)
    if (!parsed.success) throw new Error(`Invalid input_links.csv row ${index + 2}: ${parsed.error.message}`)
    return {
      ...parsed.data,
      kind: inferTransactionType(parsed.data.url) === "sale" ? "bayut_sale_listings" : "bayut_rent_listings",
      masterCommunity: masterFromCommunity(parsed.data.community),
    }
  })
}
