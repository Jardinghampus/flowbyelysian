import type { Page } from "playwright"
import type { DetailExtractionResult } from "./types.js"
import { compactWhitespace, looksBlocked, waitForManualVerification } from "./utils.js"

const LISTING_LABELS = ["Reference", "Reference no.", "Property reference", "Listing ID", "Bayut ID"]
const PERMIT_LABELS = ["DLD permit", "Trakheesi permit", "Permit number", "Permit Number", "RERA permit"]

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

export async function extractDetailListing(page: Page): Promise<DetailExtractionResult> {
  if (await looksBlocked(page)) {
    await waitForManualVerification(page)
    if (await looksBlocked(page)) return { listing_number: "", permit_number: "", blocked: true }
  }

  const text = await page.locator("body").innerText({ timeout: 15000 }).catch(() => "")
  const listingNumber = valueAfterLabel(text, LISTING_LABELS)
  const permitNumber = valueAfterLabel(text, PERMIT_LABELS)

  return {
    listing_number: listingNumber || permitNumber,
    permit_number: permitNumber,
    blocked: false,
  }
}
