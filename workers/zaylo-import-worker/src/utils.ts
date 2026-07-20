import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Page } from "playwright"
import { config } from "./config.js"

export function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function normalizeBayutUrl(url: string): string {
  if (!url) return ""
  const absolute = new URL(url, "https://www.bayut.com")
  absolute.hash = ""
  return absolute.toString()
}

export function parseNumber(value: string | undefined): number | null {
  if (!value) return null
  const cleaned = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/)
  return cleaned ? Number(cleaned[0]) : null
}

export function parseBeds(value: string | undefined): number | null {
  if (!value) return null
  if (/studio/i.test(value)) return 0
  const n = parseNumber(value)
  if (n === null) return null
  if (n < 0 || n > 6) return Math.min(6, Math.max(0, Math.round(n)))
  return Math.round(n)
}

export function inferTransactionType(url: string): "rent" | "sale" {
  if (/\/for-sale\//i.test(url) || /\/transactions\/sale\//i.test(url)) return "sale"
  return "rent"
}

export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const low = Math.min(minMs, maxMs)
  const high = Math.max(minMs, maxMs)
  const delay = Math.floor(low + Math.random() * (high - low + 1))
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function waitForManualVerification(
  page: Page,
  timeoutMs = config.CAPTCHA_WAIT_MS
): Promise<boolean> {
  console.log("\nPlease solve the verification in the browser (waiting up to 3 min)...")
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    await page.waitForTimeout(2500).catch(() => undefined)
    if (!(await looksBlocked(page))) {
      console.log("Verification cleared — continuing.")
      return true
    }
  }
  console.warn("Verification timed out — continuing with listings collected so far.")
  return false
}

export async function looksBlocked(page: Page): Promise<boolean> {
  const status = await page
    .evaluate(() => {
      const bodyText = document.body?.innerText ?? ""
      const title = document.title ?? ""
      return { bodyText, title }
    })
    .catch(() => ({ bodyText: "", title: "" }))

  const text = `${status.title}\n${status.bodyText}`
  return /cloudflare|captcha|verify you are human|checking your browser|access denied|error 403|403 forbidden|too many requests|error 429|429/i.test(
    text
  )
}

/** Bayut 404 / soft page ("The page you were looking for could not be found"). */
export async function looksNotFound(page: Page): Promise<boolean> {
  const status = await page
    .evaluate(() => {
      const bodyText = document.body?.innerText ?? ""
      const title = document.title ?? ""
      const h1 = document.querySelector("h1")?.textContent ?? ""
      return { bodyText: bodyText.slice(0, 2500), title, h1 }
    })
    .catch(() => ({ bodyText: "", title: "", h1: "" }))

  const text = `${status.title}\n${status.h1}\n${status.bodyText}`
  return (
    /page you (?:were looking for|tried to (?:find|reach)).{0,40}(?:could not be found|doesn'?t exist|does not exist)/i.test(
      text
    ) ||
    /sidan (?:vi|du).{0,40}finns inte/i.test(text) ||
    /we (?:can'?t|cannot) find (?:that|this|the) page/i.test(text)
  )
}

export async function saveDebugHtml(page: Page, community: string, suffix: string): Promise<string> {
  const safeCommunity = community.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown"
  const today = new Date().toISOString().slice(0, 10)
  const filePath = path.resolve("debug", `${today}-${safeCommunity}-${suffix}.html`)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, await page.content(), "utf8")
  return filePath
}

export function compactJson(value: unknown): string {
  return JSON.stringify(value)
}

export function masterFromCommunity(community: string): string {
  if (/villanova|amaranta|la rosa|la quinta|la tilia|la violeta|aldea/i.test(community)) {
    return "Villanova"
  }
  if (/lagoons|costa brava|ibiza|malta|marbella|monte carlo|morocco|portofino|santorini|venice/i.test(community)) {
    return "DAMAC Lagoons"
  }
  if (/damac hills|akoya|brookfield|calero|trump estates|picadilly|queens meadows/i.test(community)) {
    return "DAMAC Hills"
  }
  if (/town square|hayat|maha|naseem townhouses|noor|safi|sama|shams|zahra|kaya/i.test(community)) {
    return "Town Square"
  }
  if (/arabian ranches\s*3|anya|bliss|caya|elie saab|raya|ruba/i.test(community)) {
    return "Arabian Ranches 3"
  }
  if (/arabian ranches\s*2|azalea|camelia|casa|lila|palma|rasha|samara|yasmin/i.test(community)) {
    return "Arabian Ranches 2"
  }
  if (/arabian ranches(?:\s*1)?|al reem|alvorada|alma|aseel|hattan|avenida|mirador|palmera|saheel|savannah|terra nova|polo homes|al mahra/i.test(community)) {
    return "Arabian Ranches"
  }
  if (/mudon|arabella|ranim|rahat|al salam/i.test(community)) return "Mudon"
  if (/mira oasis/i.test(community)) return "Mira Oasis"
  if (
    /dubai hills|maple|sidra|golf place|golf grove|club villas|fairway vistas|parkway vistas|majestic vistas|emerald hills/i.test(
      community
    )
  ) {
    return "Dubai Hills Estate"
  }
  if (/tilal al ghaf|harmony|elan|aura gardens/i.test(community)) return "Tilal Al Ghaf"
  return community
}

export const TARGET_POCKETS = [
  "Mudon",
  "DAMAC Hills",
  "DAMAC Lagoons",
  "Town Square",
  "Villanova",
  "Arabian Ranches",
  "Arabian Ranches 2",
  "Arabian Ranches 3",
  "Mira Oasis",
  "Dubai Hills Estate",
  "Tilal Al Ghaf",
] as const

export function isTargetPocket(location: string): boolean {
  const master = masterFromCommunity(location || "")
  return (TARGET_POCKETS as readonly string[]).includes(master)
}

/** Parse Bayut breadcrumb into master community + leaf sub-area. */
export function parseBayutLocation(location: string, fallback = ""): {
  community: string
  masterCommunity: string
  subArea: string
  inTarget: boolean
} {
  const raw = compactWhitespace(location || fallback)
  const parts = raw
    .split(",")
    .map((p) => compactWhitespace(p))
    .filter(Boolean)
    .filter((p) => !/^dubai$/i.test(p))

  const joined = parts.join(", ") || fallback
  const master = masterFromCommunity(joined)
  const inTarget = (TARGET_POCKETS as readonly string[]).includes(master)

  // Bayut order: most-specific → … → master. Keep only the leaf for filterable sub-areas
  // e.g. "Mudon Al Ranim 4, Mudon Al Ranim, Mudon, Dubai" → area Mudon, sub "Al Ranim 4"
  const leaf = parts[0] || joined || master
  const subArea = normalizeSubAreaLeaf(leaf, master)

  return {
    community: master,
    masterCommunity: master,
    subArea: subArea || master,
    inTarget,
  }
}

/** "Mudon Al Ranim 4" → "Al Ranim 4"; "Arabella 1" stays; "Saheel" stays. */
export function normalizeSubAreaLeaf(leaf: string, master: string): string {
  let s = compactWhitespace(leaf)
  if (!s) return master

  // Strip leading master community name when present ("Mudon Al Ranim 4" → "Al Ranim 4")
  const escaped = master.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  s = s.replace(new RegExp(`^${escaped}\\s+`, "i"), "").trim()

  // Common Bayut prefixes that still include master branding
  if (master === "Mudon") {
    s = s.replace(/^Mudon\s+/i, "").trim()
    // "Arabella Townhouses" / "Arabella Townhouses 2" → Arabella / Arabella 2
    const arabella = s.match(/^Arabella(?:\s+Townhouses?)?(?:\s*(\d+))?$/i)
    if (arabella) {
      return arabella[1] ? `Arabella ${arabella[1]}` : "Arabella"
    }
    // "Arabella 1 Townhouses" etc.
    const arabellaNum = s.match(/^Arabella\s*(\d+)/i)
    if (arabellaNum) return `Arabella ${arabellaNum[1]}`
  }
  if (master === "DAMAC Hills") {
    s = s.replace(/^DAMAC\s+Hills\s+/i, "").trim()
  }
  if (master === "DAMAC Lagoons") {
    s = s.replace(/^DAMAC\s+Lagoons\s+/i, "").trim()
  }
  if (master === "Town Square") {
    s = s.replace(/^Town\s+Square\s+/i, "").trim()
  }
  if (master === "Mira Oasis") {
    s = s.replace(/^Mira\s+Oasis\s+/i, "").trim()
    const phase = s.match(/^(\d+)$/)
    if (phase) return `Mira Oasis ${phase[1]}`
  }
  if (/^Arabian Ranches/i.test(master)) {
    s = s.replace(/^Arabian\s+Ranches(?:\s*[123])?\s+/i, "").trim()
  }

  return s || leaf
}

/** Normalize Bayut type labels into Villa | Townhouse | Apartment. */
export function normalizePropertyType(raw: string): string {
  const t = raw.trim().toLowerCase()
  if (!t) return ""
  if (/town\s*houses?/.test(t)) return "Townhouse"
  if (/villas?|compound/.test(t)) return "Villa"
  if (/apartments?|flat|penthouses?|duplex|studio|hotel apartment/.test(t)) return "Apartment"
  return ""
}

export function extractPropertyType(text: string, href = ""): string {
  const fromText = text.match(
    /\b(Townhouses?|Villas?|Apartments?|Penthouses?|Duplex(?:es)?|Hotel Apartments?|Compounds?)\b/i
  )
  if (fromText?.[1]) {
    const normalized = normalizePropertyType(fromText[1])
    if (normalized) return normalized
  }
  if (/\/townhouses?\//i.test(href)) return "Townhouse"
  if (/\/villas?\//i.test(href)) return "Villa"
  if (/\/apartments?\//i.test(href)) return "Apartment"
  return ""
}

export function extractBedsFromText(text: string): number | null {
  const patterns = [
    /\b(Studio)\b/i,
    /\b(\d+(?:\.\d+)?)\s*BR\b/i,
    /\b(\d+(?:\.\d+)?)\s*Bedrooms?\b/i,
    /\b(\d+(?:\.\d+)?)\s*[\n\r\t ]*(?:Beds?|Bedrooms?|BR)\b/i,
    /\b(?:Beds?|Bedrooms?|BR)\s*[:\-]?\s*(\d+(?:\.\d+)?|Studio)\b/i,
    /(\d+(?:\.\d+)?)\s*bed/i,
    // Bayut card stats row: beds \n baths \n size  e.g. "3\n4\n2,100"
    /(?:^|\n)\s*(\d{1,2})\s*\n\s*\d{1,2}\s*\n\s*[\d,]{3,}/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match) continue
    const raw = match[1] || match[0]
    const beds = parseBeds(raw)
    if (beds !== null) return beds
  }
  return null
}

export function isJunkContactName(value: string): boolean {
  const v = compactWhitespace(value)
  if (!v || v.length < 2) return true
  return /find my agent|call(?:\s+now)?|email|whatsapp|contact(?:\s+agent)?|^agent$|superagent|verified|trucheck|trubroker|tru.?broker|premium|view phone|show number|listed by|agency$/i.test(
    v
  )
}

export function cleanContactName(value: string): string {
  const v = compactWhitespace(value)
  if (!v || isJunkContactName(v)) return ""
  return v
}

/** Resolve master community from Bayut location breadcrumb text. */
export function resolveCommunityFromLocation(location: string, fallback: string): {
  community: string
  masterCommunity: string
} {
  const parsed = parseBayutLocation(location, fallback)
  return { community: parsed.community, masterCommunity: parsed.masterCommunity }
}
