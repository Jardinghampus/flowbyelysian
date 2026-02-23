/**
 * Core Conversation Flow Logic
 * State machine for WhatsApp chat bot
 *
 * Flow: START → INVENTORY → HANDOFF_PENDING → DONE
 */

import {
  getSession,
  updateSession,
  addToHistory,
  type ChatSession,
  type ChatState,
} from "./state"
import {
  parseSearchQuery,
  searchInventory,
  formatSearchResults,
  hasSearchIntent,
  type SearchResult,
} from "./inventory"

export interface ProcessResult {
  response: string
  session: ChatSession
  searchResult?: SearchResult
  handoffRequired?: boolean
  leadData?: {
    name: string
    phone: string
    context: string
    shownProperties: string[]
  }
}

// Affirmative responses (multi-language support)
const AFFIRMATIVE = ["yes", "ja", "yeah", "yep", "sure", "ok", "okay", "please", "tack", "gärna", "absolut", "visst"]
const NEGATIVE = ["no", "nej", "nope", "nah", "not now", "later", "inte nu", "senare", "kanske"]

/**
 * Check if response is affirmative
 */
function isAffirmative(message: string): boolean {
  const lower = message.toLowerCase().trim()
  return AFFIRMATIVE.some((word) => lower.includes(word))
}

/**
 * Check if response is negative
 */
function isNegative(message: string): boolean {
  const lower = message.toLowerCase().trim()
  return NEGATIVE.some((word) => lower.includes(word))
}

/**
 * Extract contact information from message
 */
function extractContactInfo(message: string): { name?: string; phone?: string } {
  const result: { name?: string; phone?: string } = {}

  // Extract phone number (various formats)
  const phoneMatch = message.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,14}/)
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/[\s\-\.]/g, "")
  }

  // Extract name (text before phone or comma-separated)
  const parts = message.split(/[,\n]/)
  if (parts.length >= 1) {
    const namePart = parts[0].replace(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,14}/g, "").trim()
    if (namePart && namePart.length > 2 && !/^\d+$/.test(namePart)) {
      result.name = namePart
    }
  }

  return result
}

/**
 * Process incoming message and return response
 */
export function processMessage(sessionId: string, message: string): ProcessResult {
  const session = getSession(sessionId)

  // Add user message to history
  addToHistory(sessionId, "user", message)

  let response: string
  let nextState: ChatState = session.state
  let searchResult: SearchResult | undefined
  let handoffRequired = false
  let leadData: ProcessResult["leadData"] | undefined

  switch (session.state) {
    case "START":
      // Check for property search intent
      if (hasSearchIntent(message)) {
        const query = parseSearchQuery(message)
        searchResult = searchInventory(query)

        response = formatSearchResults(searchResult)

        if (searchResult.properties.length > 0) {
          response += "\n\nWould you like an agent to contact you about these properties?"
          nextState = "INVENTORY"

          // Store search context and shown properties
          updateSession(sessionId, {
            searchContext: query,
            shownProperties: searchResult.properties.map((p) => p.id),
          })
        }
      } else {
        // Greeting or unclear intent
        response =
          "Hello! Welcome to ZFlow by Zaylo. I can help you find properties in Dubai.\n\n" +
          "Tell me what you're looking for - for example:\n" +
          "• '3 bedroom villa in Palm Jumeirah'\n" +
          "• 'Apartment in Dubai Marina under 3M'\n" +
          "• '2BR for rent in Downtown'"
      }
      break

    case "INVENTORY":
      // User has seen properties, check if they want agent contact
      if (isAffirmative(message)) {
        response =
          "Great! Please share your contact details so our agent can reach you.\n\n" +
          "Please provide your name and phone number (e.g., 'John Smith, +971501234567')"
        nextState = "HANDOFF_PENDING"
      } else if (isNegative(message)) {
        response =
          "No problem! Feel free to browse more properties or come back anytime.\n\n" +
          "Is there anything else I can help you find?"
        nextState = "START"
      } else if (hasSearchIntent(message)) {
        // New search query
        const query = parseSearchQuery(message)
        searchResult = searchInventory(query)

        response = formatSearchResults(searchResult)

        if (searchResult.properties.length > 0) {
          response += "\n\nWould you like an agent to contact you about these properties?"

          updateSession(sessionId, {
            searchContext: query,
            shownProperties: searchResult.properties.map((p) => p.id),
          })
        }
      } else {
        response =
          "Would you like an agent to contact you about these properties?\n\n" +
          "Reply 'Yes' to connect with an agent, or tell me if you'd like to search for something else."
      }
      break

    case "HANDOFF_PENDING":
      // Collect contact information
      const contactInfo = extractContactInfo(message)

      if (contactInfo.name && contactInfo.phone) {
        response =
          `Thank you, ${contactInfo.name}! An agent from Zaylo will contact you at ${contactInfo.phone} shortly.\n\n` +
          "In the meantime, feel free to browse our website for more properties."

        nextState = "DONE"
        handoffRequired = true

        // Prepare lead data for handoff
        leadData = {
          name: contactInfo.name,
          phone: contactInfo.phone,
          context: `Search: ${JSON.stringify(session.searchContext || {})}`,
          shownProperties: session.shownProperties || [],
        }

        updateSession(sessionId, {
          leadInfo: contactInfo,
        })
      } else if (contactInfo.phone && !contactInfo.name) {
        response = "Thanks! Could you also share your name so our agent knows who to ask for?"
        updateSession(sessionId, {
          leadInfo: { ...session.leadInfo, phone: contactInfo.phone },
        })
      } else if (contactInfo.name && !contactInfo.phone) {
        response = `Thanks ${contactInfo.name}! Could you also share your phone number?`
        updateSession(sessionId, {
          leadInfo: { ...session.leadInfo, name: contactInfo.name },
        })
      } else {
        response =
          "Please share your name and phone number so our agent can contact you.\n\n" +
          "Format: 'Your Name, +971501234567'"
      }
      break

    case "DONE":
      // Conversation complete, allow new searches
      if (hasSearchIntent(message)) {
        const query = parseSearchQuery(message)
        searchResult = searchInventory(query)

        response = formatSearchResults(searchResult)

        if (searchResult.properties.length > 0) {
          response += "\n\nWould you like an agent to contact you about these properties?"
          nextState = "INVENTORY"

          updateSession(sessionId, {
            searchContext: query,
            shownProperties: searchResult.properties.map((p) => p.id),
          })
        }
      } else {
        response =
          "Is there anything else I can help you find? Just describe the property you're looking for!"
        nextState = "START"
      }
      break
  }

  // Update session state
  updateSession(sessionId, { state: nextState })

  // Add bot response to history
  addToHistory(sessionId, "bot", response)

  return {
    response,
    session: getSession(sessionId),
    searchResult,
    handoffRequired,
    leadData,
  }
}

/**
 * Get welcome message for new sessions
 */
export function getWelcomeMessage(): string {
  return (
    "Hello! Welcome to ZFlow by Zaylo.\n\n" +
    "I can help you find your perfect property in Dubai. Just tell me what you're looking for:\n\n" +
    "• Location (Palm Jumeirah, Dubai Marina, Downtown, etc.)\n" +
    "• Number of bedrooms\n" +
    "• Property type (villa, apartment, townhouse)\n" +
    "• Budget (optional)\n\n" +
    "For example: 'Looking for a 3 bedroom villa in Palm Jumeirah'"
  )
}
