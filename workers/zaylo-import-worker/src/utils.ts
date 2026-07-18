import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import type { Page } from "playwright"

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

export async function waitForManualVerification(page: Page): Promise<void> {
  console.log("\nPlease solve the verification in the browser, then press Enter in terminal.")
  const rl = createInterface({ input, output })
  await rl.question("")
  rl.close()
  await page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => undefined)
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined)
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
  if (/arabian ranches 3|anya|bliss|caya|elie saab|raya|ruba/i.test(community)) {
    return "Arabian Ranches 3"
  }
  if (/arabian ranches 2|azalea|camelia|casa|lila|palma|rasha|samara|yasmin/i.test(community)) {
    return "Arabian Ranches 2"
  }
  if (/arabian ranches|al reem|alvorada|alma|aseel|hattan|avenida|mirador|palmera|saheel|savannah|terra nova|polo homes|al mahra/i.test(community)) {
    return "Arabian Ranches"
  }
  if (/mudon|arabella|ranim|rahat|al salam|naseem/i.test(community)) return "Mudon"
  if (/mira|reem/i.test(community)) return "Reem"
  return community
}
