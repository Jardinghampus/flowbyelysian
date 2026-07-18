import type { Page } from "playwright"
import type { DetailExtractionResult } from "./types.js"
import {
  cleanContactName,
  compactWhitespace,
  extractBedsFromText,
  extractPropertyType,
  looksBlocked,
  waitForManualVerification,
} from "./utils.js"

const LISTING_LABELS = ["Reference", "Reference no.", "Property reference", "Listing ID", "Bayut ID", "Bayut"]
/** Prefer exact Regulatory Information labels first. */
const PERMIT_LABELS = [
  "Permit Number",
  "Permit number",
  "Permit No",
  "Permit #",
  "DLD Permit Number",
  "DLD permit",
  "Trakheesi permit",
  "Trakheesi",
  "RERA permit",
  "Permit",
]
const AGENCY_LABELS = ["Registered Agency", "Agency"]
const TYPE_LABELS = ["Type", "Property type", "Category"]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isLikelyIdentifier(value: string): boolean {
  const cleaned = value.trim()
  if (!cleaned || /recommended|checked|verified|tru.?broker|for you|contact|call|email|qr code/i.test(cleaned)) {
    return false
  }
  if (!/\d/.test(cleaned)) return false
  return /^[A-Z0-9][A-Z0-9\s\-_/.]{2,}$/i.test(cleaned)
}

function isLikelyPermit(value: string): boolean {
  const cleaned = value.trim().replace(/\s+/g, "")
  if (!cleaned) return false
  // e.g. 6914771600
  if (/^\d{6,20}$/.test(cleaned)) return true
  if (/^[A-Z0-9][A-Z0-9\-_/]{5,}$/i.test(cleaned) && /\d/.test(cleaned)) return true
  return false
}

function isLikelyAgency(value: string): boolean {
  const cleaned = compactWhitespace(value)
  if (!cleaned || cleaned.length < 3 || cleaned.length > 120) return false
  if (/call|email|whatsapp|permit|zone name|rera|brn|^agent$/i.test(cleaned)) return false
  // Agencies usually include L.L.C / LLC / Properties / Realty etc.
  return /[A-Za-z]/.test(cleaned)
}

function valueAfterLabel(text: string, labels: string[], validator: (v: string) => boolean): string {
  const lines = text.split(/\n+/).map(compactWhitespace).filter(Boolean)

  for (const label of labels) {
    const sameLinePattern = new RegExp(`^${escapeRegExp(label)}\\s*(?:no\\.?|number|#)?\\s*[:\\-]\\s*(.+)$`, "i")
    const labelOnlyPattern = new RegExp(`^${escapeRegExp(label)}\\s*(?:no\\.?|number|#)?\\s*$`, "i")

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const sameLine = line.match(sameLinePattern)?.[1]?.trim()
      if (sameLine && validator(sameLine)) return sameLine

      if (labelOnlyPattern.test(line)) {
        const next = lines[index + 1] ?? ""
        if (validator(next)) return next
      }
    }
  }

  return ""
}

function nameAfterLabel(text: string, labels: string[]): string {
  const lines = text.split(/\n+/).map(compactWhitespace).filter(Boolean)
  for (const label of labels) {
    const sameLine = new RegExp(`^${escapeRegExp(label)}\\s*[:\\-]\\s*(.+)$`, "i")
    const labelOnly = new RegExp(`^${escapeRegExp(label)}\\s*$`, "i")
    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(sameLine)?.[1]?.trim()
      if (m && isLikelyAgency(m)) return m
      if (labelOnly.test(lines[i])) {
        const next = lines[i + 1] ?? ""
        if (isLikelyAgency(next)) return next
      }
    }
  }
  return ""
}

function typeAfterLabel(text: string): string {
  const lines = text.split(/\n+/).map(compactWhitespace).filter(Boolean)
  for (const label of TYPE_LABELS) {
    const sameLine = new RegExp(`^${escapeRegExp(label)}\\s*[:\\-]\\s*(.+)$`, "i")
    const labelOnly = new RegExp(`^${escapeRegExp(label)}\\s*$`, "i")
    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(sameLine)?.[1]?.trim()
      if (m) {
        const normalized = extractPropertyType(m)
        if (normalized) return normalized
      }
      if (labelOnly.test(lines[i])) {
        const next = lines[i + 1] ?? ""
        const normalized = extractPropertyType(next)
        if (normalized) return normalized
      }
    }
  }
  return extractPropertyType(text)
}

function extractPermitFromText(text: string): string {
  const labeled = valueAfterLabel(text, PERMIT_LABELS, isLikelyPermit)
  if (labeled) return labeled

  const patterns = [
    /Permit\s*Number\s*[:\-]?\s*(\d{6,20})/i,
    /(?:DLD|Trakheesi|RERA)?\s*Permit(?:\s*(?:No\.?|Number|#))?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_\/]{5,})/i,
    /\bPermit\b[^0-9A-Z]{0,20}(\d{8,18})\b/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1] && isLikelyPermit(match[1])) return match[1].trim()
  }
  return ""
}

/**
 * Pull Regulatory Information fields from Bayut detail pages:
 * Permit Number + Registered Agency (ignore broker / agent name).
 */
export async function extractDetailListing(page: Page): Promise<DetailExtractionResult & { beds: number | null }> {
  if (await looksBlocked(page)) {
    const cleared = await waitForManualVerification(page)
    if (!cleared || (await looksBlocked(page))) {
      return {
        listing_number: "",
        permit_number: "",
        agency: "",
        agent_name: "",
        property_type: "",
        beds: null,
        blocked: true,
      }
    }
  }

  // Expand "Regulatory Information" if collapsed
  await page
    .locator("text=/Regulatory Information/i")
    .first()
    .click({ timeout: 2000 })
    .catch(() => undefined)
  await page.waitForTimeout(400).catch(() => undefined)

  const fromDom = await page.evaluate(() => {
    const pairs: Record<string, string> = {}
    const nodes = Array.from(document.querySelectorAll("li, div, dt, dd, span, p"))
    for (let i = 0; i < nodes.length; i += 1) {
      const label = (nodes[i].textContent || "").replace(/\s+/g, " ").trim()
      if (!/^(Permit Number|Registered Agency|Zone Name|RERA|BRN)$/i.test(label)) continue
      const next = nodes[i].nextElementSibling
      const value =
        (next?.textContent || "").replace(/\s+/g, " ").trim() ||
        (nodes[i].parentElement?.textContent || "")
          .replace(label, "")
          .replace(/\s+/g, " ")
          .trim()
      if (value && value.length < 120) pairs[label.toLowerCase()] = value
    }

    // Fallback: scan full text lines for label/value adjacency
    const lines = (document.body?.innerText || "")
      .split(/\n+/)
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter(Boolean)
    for (let i = 0; i < lines.length; i += 1) {
      if (/^Permit Number$/i.test(lines[i]) && lines[i + 1]) pairs["permit number"] = lines[i + 1]
      if (/^Registered Agency$/i.test(lines[i]) && lines[i + 1]) pairs["registered agency"] = lines[i + 1]
    }

    return {
      permit: pairs["permit number"] || "",
      agency: pairs["registered agency"] || "",
      zone: pairs["zone name"] || "",
      rera: pairs["rera"] || "",
      brn: pairs["brn"] || "",
    }
  })

  const text = await page.locator("body").innerText({ timeout: 15000 }).catch(() => "")
  const listingNumber = valueAfterLabel(text, LISTING_LABELS, isLikelyIdentifier)
  const permitNumber =
    (fromDom.permit && isLikelyPermit(fromDom.permit) ? fromDom.permit : "") ||
    extractPermitFromText(text) ||
    valueAfterLabel(text, PERMIT_LABELS, isLikelyPermit)

  // Registered Agency only — never broker / agent card
  const agency =
    cleanContactName(fromDom.agency) ||
    cleanContactName(nameAfterLabel(text, AGENCY_LABELS)) ||
    ""

  const propertyType = typeAfterLabel(text)
  const beds = extractBedsFromText(text)

  return {
    listing_number: listingNumber || permitNumber,
    permit_number: permitNumber,
    agency,
    agent_name: "", // intentionally ignored (broker name)
    property_type: propertyType,
    beds,
    blocked: false,
  }
}
