import type { Page } from "playwright"
import type { DetailExtractionResult } from "./types.js"
import { compactWhitespace, looksBlocked, waitForManualVerification } from "./utils.js"

const LISTING_LABELS = ["Reference", "Reference no.", "Property reference", "Listing ID", "Bayut ID"]
const PERMIT_LABELS = ["DLD permit", "Trakheesi permit", "Permit number", "Permit Number", "RERA permit"]
const AGENCY_LABELS = ["Agency", "Broker", "Company"]
const AGENT_LABELS = ["Agent", "Listed by", "Property agent", "Contact"]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isLikelyIdentifier(value: string): boolean {
  const cleaned = value.trim()
  if (!cleaned || /recommended|checked|verified|tru.?broker|for you|contact|call|email/i.test(cleaned)) return false
  if (!/\d/.test(cleaned)) return false
  return /^[A-Z0-9][A-Z0-9\s\-_/.]{2,}$/i.test(cleaned)
}

function valueAfterLabel(text: string, labels: string[]): string {
  const lines = text.split(/\n+/).map(compactWhitespace).filter(Boolean)

  for (const label of labels) {
    const sameLinePattern = new RegExp(`^${escapeRegExp(label)}\\s*(?:no\\.?|number|#)?\\s*[:\\-]\\s*(.+)$`, "i")
    const labelOnlyPattern = new RegExp(`^${escapeRegExp(label)}\\s*(?:no\\.?|number|#)?\\s*$`, "i")

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const sameLine = line.match(sameLinePattern)?.[1]?.trim()
      if (sameLine && isLikelyIdentifier(sameLine)) return sameLine

      if (labelOnlyPattern.test(line)) {
        const next = lines[index + 1] ?? ""
        if (isLikelyIdentifier(next)) return next
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
      if (m && m.length >= 2 && m.length <= 80 && !/call|email|whatsapp/i.test(m)) return m
      if (labelOnly.test(lines[i])) {
        const next = lines[i + 1] ?? ""
        if (next.length >= 2 && next.length <= 80 && !/call|email|whatsapp|permit|reference/i.test(next)) {
          return next
        }
      }
    }
  }
  return ""
}

export async function extractDetailListing(page: Page): Promise<DetailExtractionResult> {
  if (await looksBlocked(page)) {
    await waitForManualVerification(page)
    if (await looksBlocked(page)) {
      return { listing_number: "", permit_number: "", agency: "", agent_name: "", blocked: true }
    }
  }

  const fromDom = await page.evaluate(() => {
    const agency =
      document
        .querySelector<HTMLAnchorElement>("a[href*='/companies/'], a[href*='/brokers/'], a[href*='/agency/']")
        ?.textContent?.trim() ||
      document.querySelector<HTMLImageElement>("aside img[alt], [class*='agency'] img[alt]")?.alt?.trim() ||
      ""
    const agent =
      document
        .querySelector<HTMLElement>("[aria-label*='Agent'], [data-testid*='agent'], a[href*='/agents/']")
        ?.textContent?.trim() || ""
    return { agency, agent }
  })

  const text = await page.locator("body").innerText({ timeout: 15000 }).catch(() => "")
  const listingNumber = valueAfterLabel(text, LISTING_LABELS)
  const permitNumber = valueAfterLabel(text, PERMIT_LABELS)
  const agency = fromDom.agency || nameAfterLabel(text, AGENCY_LABELS)
  const agentName = fromDom.agent || nameAfterLabel(text, AGENT_LABELS)

  return {
    listing_number: listingNumber || permitNumber,
    permit_number: permitNumber,
    agency,
    agent_name: agentName,
    blocked: false,
  }
}
