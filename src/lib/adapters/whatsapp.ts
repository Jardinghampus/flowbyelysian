/**
 * WhatsApp Adapter
 * Isolates WhatsApp-specific logic for easy integration with real WhatsApp Business API
 *
 * In production, swap this adapter to connect to:
 * - WhatsApp Business API (Cloud or On-Premise)
 * - WhatsApp Business Platform
 * - Third-party providers (Twilio, MessageBird, etc.)
 */

export interface WhatsAppInboundMessage {
  /** Message ID from WhatsApp */
  messageId: string
  /** Sender's phone number */
  from: string
  /** Message content */
  text: string
  /** Timestamp */
  timestamp: number
  /** Message type (text, image, etc.) */
  type: "text" | "image" | "document" | "audio" | "video" | "location" | "contacts"
}

export interface WhatsAppOutboundMessage {
  /** Recipient phone number */
  to: string
  /** Message text */
  text: string
  /** Optional message template */
  template?: {
    name: string
    language: string
    components?: Array<{
      type: string
      parameters: Array<{ type: string; text: string }>
    }>
  }
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: { name: string }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
        }>
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

/**
 * Parse incoming WhatsApp webhook payload
 * In demo mode, this accepts simplified format
 */
export function parseInboundMessage(
  payload: WhatsAppWebhookPayload | { sessionId: string; message: string }
): WhatsAppInboundMessage | null {
  // Demo format (simplified)
  if ("sessionId" in payload && "message" in payload) {
    return {
      messageId: `demo-${Date.now()}`,
      from: payload.sessionId,
      text: payload.message,
      timestamp: Date.now(),
      type: "text",
    }
  }

  // Real WhatsApp webhook format
  try {
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== "text" || !message.text?.body) {
      return null
    }

    return {
      messageId: message.id,
      from: message.from,
      text: message.text.body,
      timestamp: parseInt(message.timestamp) * 1000,
      type: "text",
    }
  } catch {
    return null
  }
}

/**
 * Format outbound message for WhatsApp API
 */
export function formatOutboundMessage(
  to: string,
  text: string
): WhatsAppOutboundMessage {
  return {
    to,
    text,
  }
}

/**
 * Send message via WhatsApp API
 * In demo mode, this is a no-op that returns success
 * In production, implement actual API call
 */
export async function sendWhatsAppMessage(
  message: WhatsAppOutboundMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Demo mode - just log and return success
  console.log("[WhatsApp Adapter] Sending message:", {
    to: message.to,
    text: message.text.substring(0, 100) + (message.text.length > 100 ? "..." : ""),
  })

  // In production, implement actual WhatsApp API call:
  /*
  const response = await fetch(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "text",
        text: { body: message.text },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    return { success: false, error: error.error?.message }
  }

  const data = await response.json()
  return { success: true, messageId: data.messages?.[0]?.id }
  */

  // Demo mode success
  return {
    success: true,
    messageId: `demo-outbound-${Date.now()}`,
  }
}

/**
 * Verify WhatsApp webhook (for initial setup)
 */
export function verifyWebhook(
  mode: string,
  token: string,
  challenge: string,
  verifyToken: string
): string | null {
  if (mode === "subscribe" && token === verifyToken) {
    return challenge
  }
  return null
}

/**
 * Generate session ID from phone number
 * Ensures consistent session identification
 */
export function getSessionIdFromPhone(phone: string): string {
  // Normalize phone number
  const normalized = phone.replace(/[^\d+]/g, "")
  return `wa-${normalized}`
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "")

  // UAE format
  if (cleaned.startsWith("+971") || cleaned.startsWith("971")) {
    const digits = cleaned.replace(/^\+?971/, "")
    return `+971 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }

  // Swedish format
  if (cleaned.startsWith("+46") || cleaned.startsWith("46")) {
    const digits = cleaned.replace(/^\+?46/, "")
    return `+46 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }

  return cleaned
}
