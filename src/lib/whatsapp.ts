/**
 * WhatsApp deep-link helpers.
 * We deliberately do NOT embed WhatsApp Business API —
 * agents chat in WhatsApp; CRM only opens the right number with context.
 */

export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 8) return null
  // UAE local numbers starting with 05… → 9715…
  if (digits.startsWith("05") && digits.length === 10) {
    return `971${digits.slice(1)}`
  }
  if (digits.startsWith("5") && digits.length === 9) {
    return `971${digits}`
  }
  return digits
}

export function buildWhatsAppUrl(options: {
  phone?: string | null
  message?: string
}): string | null {
  const phone = normalizeWhatsAppNumber(options.phone)
  if (!phone) return null
  const text = options.message?.trim()
  if (text) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }
  return `https://wa.me/${phone}`
}

/** Open WhatsApp for a CRM contact. Returns false if no usable number. */
export function openWhatsApp(options: {
  phone?: string | null
  message?: string
}): boolean {
  const url = buildWhatsAppUrl(options)
  if (!url) return false
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer")
  }
  return true
}

export function defaultOutreachMessage(input: {
  contactName?: string | null
  propertyTitle?: string | null
  agentName?: string | null
}): string {
  const hi = input.contactName ? `Hi ${input.contactName.split(" ")[0]},` : "Hi,"
  const property = input.propertyTitle
    ? ` regarding ${input.propertyTitle}`
    : ""
  const sign = input.agentName ? `\n\n— ${input.agentName}` : ""
  return `${hi}\n\nFollowing up${property}.${sign}`
}
