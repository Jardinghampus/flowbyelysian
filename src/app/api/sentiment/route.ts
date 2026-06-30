import { NextRequest, NextResponse } from "next/server"
import { analyseConversation, quickSentiment, type ChatMessage } from "@/lib/sentiment-analysis"

/**
 * POST /api/sentiment
 * Analyse sentiment of a conversation or single message.
 *
 * Body:
 *   - messages: ChatMessage[] — full conversation analysis
 *   - message: string — quick single-message sentiment check
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Full conversation analysis
    if (body.messages && Array.isArray(body.messages)) {
      const messages: ChatMessage[] = body.messages.map((m: Record<string, unknown>) => ({
        role: m.role as "user" | "bot",
        message: m.message as string,
        timestamp: m.timestamp as string,
      }))

      const result = analyseConversation(messages)
      return NextResponse.json({ analysis: result })
    }

    // Quick single-message check
    if (body.message && typeof body.message === "string") {
      const result = quickSentiment(body.message)
      return NextResponse.json({ quickAnalysis: result })
    }

    return NextResponse.json(
      { error: "Provide 'messages' (array) or 'message' (string)" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error analysing sentiment:", error)
    return NextResponse.json({ error: "Failed to analyse sentiment" }, { status: 500 })
  }
}
