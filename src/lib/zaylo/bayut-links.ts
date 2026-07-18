/**
 * Shared Bayut URL helpers for market listings + transactions.
 *
 * Listings  → listing_url  (live ads — weekly re-scrape marks not_seen)
 * Transactions → detail_url (Bayut View / property detail when present)
 */

export type BayutLinkKind = "listing" | "transaction"

export type BayutLinkRef = {
  kind: BayutLinkKind
  url: string
  label?: string
}

/** Normalize Bayut absolute URLs; returns "" if invalid / empty. */
export function normalizeBayutUrl(raw: string | null | undefined): string {
  const value = (raw || "").trim()
  if (!value) return ""
  try {
    const url = new URL(value)
    if (!/bayut\.com$/i.test(url.hostname) && !/\.bayut\.com$/i.test(url.hostname)) {
      return url.href
    }
    url.hash = ""
    return url.href
  } catch {
    return ""
  }
}

export function listingLink(listingUrl: string | null | undefined): BayutLinkRef | null {
  const url = normalizeBayutUrl(listingUrl)
  if (!url) return null
  return { kind: "listing", url, label: "Open listing" }
}

export function transactionLink(detailUrl: string | null | undefined): BayutLinkRef | null {
  const url = normalizeBayutUrl(detailUrl)
  if (!url) return null
  return { kind: "transaction", url, label: "Open on Bayut" }
}

/** Short id from Bayut details URL for display (e.g. details-15654169). */
export function bayutListingIdFromUrl(url: string | null | undefined): string | null {
  const href = normalizeBayutUrl(url)
  if (!href) return null
  const match = href.match(/details-(\d+)/i) || href.match(/\/property\/([^/?#]+)/i)
  return match?.[1] || null
}
