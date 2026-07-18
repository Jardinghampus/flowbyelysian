import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

type UntypedDb = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

/**
 * Find-or-create an owners row for a listing contact and return its id.
 * Phone is normalized for WhatsApp; only the listing agent should ever see it.
 */
export async function syncListingContact(
  supabase: UntypedDb,
  input: {
    agentId: string
    agentName: string
    contactName?: string | null
    contactPhone?: string | null
    area?: string | null
    subArea?: string | null
    bedrooms?: number | null
    existingOwnerId?: string | null
  }
): Promise<string | null> {
  const name = String(input.contactName || "").trim()
  const phoneRaw = String(input.contactPhone || "").trim()
  if (!name && !phoneRaw) return input.existingOwnerId || null
  if (!phoneRaw) return input.existingOwnerId || null

  const whatsapp = normalizeWhatsAppNumber(phoneRaw)
  if (!whatsapp) return input.existingOwnerId || null

  // Prefer matching by phone digits for this agent
  const phoneDigits = phoneRaw.replace(/\D/g, "")
  const tail = phoneDigits.slice(-9)
  const { data: existing } = await supabase
    .from("owners")
    .select("id, name, phone")
    .eq("user_id", input.agentId)
    .or(
      [
        tail ? `phone.ilike.%${tail}%` : null,
        `whatsapp_number.eq.${whatsapp}`,
        phoneDigits ? `whatsapp_number.eq.${phoneDigits}` : null,
      ]
        .filter(Boolean)
        .join(",")
    )
    .limit(1)
    .maybeSingle()

  const patch = {
    name: name || undefined,
    phone: phoneRaw,
    area: input.area || undefined,
    bedrooms: input.bedrooms != null ? String(input.bedrooms) : undefined,
    status: "listed" as const,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    await supabase
      .from("owners")
      .update({
        ...patch,
        name: name || existing.name,
      })
      .eq("id", existing.id)
    return existing.id as string
  }

  if (input.existingOwnerId) {
    await supabase
      .from("owners")
      .update({
        ...patch,
        name: name || "Contact",
      })
      .eq("id", input.existingOwnerId)
    return input.existingOwnerId
  }

  const { data: created, error } = await supabase
    .from("owners")
    .insert({
      user_id: input.agentId,
      name: name || "Contact",
      phone: phoneRaw,
      area: input.area || "Dubai",
      bedrooms: input.bedrooms != null ? String(input.bedrooms) : null,
      status: "listed",
      priority: "medium",
      assigned_agent_id: input.agentId,
      assigned_agent_name: input.agentName,
      notes: "Synced from listing contact",
    })
    .select("id")
    .single()

  if (error || !created) {
    console.error("syncListingContact insert failed", error)
    return null
  }

  return created.id as string
}

export async function loadContactsForListings(
  supabase: UntypedDb,
  listings: Array<{ id: string; owner_id?: string | null; owner_contact_id?: string | null }>,
  viewerId: string
): Promise<Map<string, { id: string; name: string; phone: string }>> {
  const map = new Map<string, { id: string; name: string; phone: string }>()
  const contactIds = Array.from(
    new Set(
      listings
        .filter((l) => l.owner_id === viewerId && l.owner_contact_id)
        .map((l) => String(l.owner_contact_id))
    )
  )
  if (contactIds.length === 0) return map

  const { data } = await supabase
    .from("owners")
    .select("id, name, phone")
    .in("id", contactIds)

  const byId = new Map<string, { id: string; name: string; phone: string }>(
    (data || []).map((row: { id: string; name: string; phone: string }) => [row.id, row])
  )

  for (const listing of listings) {
    if (listing.owner_id !== viewerId || !listing.owner_contact_id) continue
    const contact = byId.get(String(listing.owner_contact_id))
    if (contact?.phone) {
      map.set(listing.id, {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
      })
    }
  }

  return map
}
