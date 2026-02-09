import { NextResponse } from "next/server"
import { processMessage, getWelcomeMessage } from "@/lib/chat/logic"
import { parseInboundMessage } from "@/lib/adapters/whatsapp"
import { getSession } from "@/lib/chat/state"

export interface InboundRequest {
  sessionId: string
  message: string
}

export interface InboundResponse {
  success: boolean
  response?: string
  sessionId?: string
  state?: string
  error?: string
  properties?: Array<{
    id: string
    title: string
    price: number
    location: string
  }>
}

/**
 * POST /api/chat/inbound
 * Process incoming chat message and return bot response
 */
export async function POST(request: Request): Promise<NextResponse<InboundResponse>> {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.sessionId || typeof body.sessionId !== "string") {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      )
    }

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json(
        { success: false, error: "message is required" },
        { status: 400 }
      )
    }

    // Parse message (supports both demo and WhatsApp formats)
    const parsed = parseInboundMessage(body)
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Could not parse message" },
        { status: 400 }
      )
    }

    console.log("[Chat Inbound] Processing message:", {
      sessionId: body.sessionId,
      message: body.message.substring(0, 50),
    })

    // Process the message through conversation logic
    const result = processMessage(body.sessionId, body.message)

    console.log("[Chat Inbound] Response:", {
      sessionId: body.sessionId,
      state: result.session.state,
      responseLength: result.response.length,
      handoffRequired: result.handoffRequired,
    })

    // If handoff is required, trigger async notification
    if (result.handoffRequired && result.leadData) {
      // Fire and forget - notify in background
      fetch(new URL("/api/chat/handoff", request.url).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: body.sessionId,
          ...result.leadData,
        }),
      }).catch((err) => console.error("[Chat Inbound] Handoff error:", err))
    }

    // Return response
    return NextResponse.json({
      success: true,
      response: result.response,
      sessionId: body.sessionId,
      state: result.session.state,
      properties: result.searchResult?.properties.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location,
      })),
    })
  } catch (error) {
    console.error("[Chat Inbound] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chat/inbound
 * Get welcome message or session state
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (sessionId) {
    const session = getSession(sessionId)
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        state: session.state,
        history: session.history,
      },
    })
  }

  // Return welcome message for new sessions
  return NextResponse.json({
    success: true,
    welcome: getWelcomeMessage(),
  })
}
