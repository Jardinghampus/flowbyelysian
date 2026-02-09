/**
 * Chat State Management
 * In-memory session state for WhatsApp chat bot demo
 */

export type ChatState = "START" | "INVENTORY" | "HANDOFF_PENDING" | "DONE"

export interface ChatSession {
  id: string
  state: ChatState
  createdAt: Date
  updatedAt: Date
  /** Search context from user queries */
  searchContext?: {
    location?: string
    bedrooms?: number
    minPrice?: number
    maxPrice?: number
    propertyType?: string
  }
  /** Properties shown to user */
  shownProperties?: string[]
  /** Lead information collected */
  leadInfo?: {
    name?: string
    phone?: string
    email?: string
  }
  /** Conversation history for context */
  history: Array<{
    role: "user" | "bot"
    message: string
    timestamp: Date
  }>
}

// In-memory session storage (demo only - use Redis/DB in production)
const sessions = new Map<string, ChatSession>()

/**
 * Get or create a chat session
 */
export function getSession(sessionId: string): ChatSession {
  let session = sessions.get(sessionId)

  if (!session) {
    session = {
      id: sessionId,
      state: "START",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
    }
    sessions.set(sessionId, session)
  }

  return session
}

/**
 * Update session state
 */
export function updateSession(
  sessionId: string,
  updates: Partial<Omit<ChatSession, "id" | "createdAt">>
): ChatSession {
  const session = getSession(sessionId)

  const updated: ChatSession = {
    ...session,
    ...updates,
    updatedAt: new Date(),
  }

  sessions.set(sessionId, updated)
  return updated
}

/**
 * Add message to session history
 */
export function addToHistory(
  sessionId: string,
  role: "user" | "bot",
  message: string
): void {
  const session = getSession(sessionId)

  session.history.push({
    role,
    message,
    timestamp: new Date(),
  })

  session.updatedAt = new Date()
  sessions.set(sessionId, session)
}

/**
 * Reset a session (for testing)
 */
export function resetSession(sessionId: string): void {
  sessions.delete(sessionId)
}

/**
 * Get all active sessions (for debugging)
 */
export function getAllSessions(): ChatSession[] {
  return Array.from(sessions.values())
}

/**
 * Clean up old sessions (optional maintenance)
 */
export function cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now()
  let cleaned = 0

  for (const [id, session] of sessions.entries()) {
    if (now - session.updatedAt.getTime() > maxAgeMs) {
      sessions.delete(id)
      cleaned++
    }
  }

  return cleaned
}
