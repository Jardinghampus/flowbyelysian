/**
 * Strip owner/lead contact fields when an agent views someone else's listing or request.
 * Agents may see property facts + listing agent name, but not the client/owner contact.
 */

const PRIVATE_KEYS = [
  "owner_contact_id",
  "ownerContactId",
  "contact_id",
  "contactId",
  "contact_name",
  "contactName",
  "contact_phone",
  "contactPhone",
  "owner_phone",
  "ownerPhone",
  "owner_email",
  "ownerEmail",
  "client_phone",
  "clientPhone",
  "client_email",
  "clientEmail",
  "whatsapp",
  "whatsapp_number",
  "phone",
  "email",
  "notes", // often contains private contact instructions
] as const

export type ListingPrivacyRow = Record<string, unknown> & {
  owner_id?: string | null
}

export function sanitizeListingForViewer<T extends ListingPrivacyRow>(
  listing: T,
  viewerId: string,
  opts?: { isAdmin?: boolean }
): T {
  if (opts?.isAdmin) return listing
  if (listing.owner_id && listing.owner_id === viewerId) return listing

  const next = { ...listing } as T
  for (const key of PRIVATE_KEYS) {
    if (key in next) {
      ;(next as Record<string, unknown>)[key] = null
    }
  }
  // Keep agent display name (listing agent), never expose contact linkage
  return next
}

export function sanitizeListingsForViewer<T extends ListingPrivacyRow>(
  listings: T[],
  viewerId: string,
  opts?: { isAdmin?: boolean }
): T[] {
  return listings.map((row) => sanitizeListingForViewer(row, viewerId, opts))
}
