import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/lib/demo-auth"
import OpenAI from "openai"

// Lazy initialization to avoid build-time errors when OPENAI_API_KEY is not set
let openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })
  }
  return openai
}

// POST /api/smart/chat - Send message and get AI response
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, documentIds, collectionId } = body

    const supabase = createServerClient()

    // Fetch document context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let documentsQuery = (supabase as any)
      .from("smart_documents")
      .select(`
        *,
        analysis:smart_document_analysis(*)
      `)
      .eq("user_id", userId)

    if (documentIds && documentIds.length > 0) {
      documentsQuery = documentsQuery.in("id", documentIds)
    } else if (collectionId) {
      documentsQuery = documentsQuery.eq("collection_id", collectionId)
    }

    const { data: documents } = await documentsQuery.limit(10)

    // Build context for AI
    const documentContext = documents?.map((doc: {
      name: string
      property_name?: string
      area_name?: string
      developer?: string
      analysis?: {
        plot_size?: number
        built_up_area?: number
        bedroom_count?: number
        bathroom_count?: number
        floor_count?: number
        parking_spaces?: number
        garden_area?: number
        balcony_area?: number
        pool_size?: string
        features?: string[]
        room_dimensions?: Array<{ name: string; width: number; length: number; area: number }>
        summary?: string
      }
    }) => ({
      name: doc.name,
      property: doc.property_name,
      area: doc.area_name,
      developer: doc.developer,
      analysis: doc.analysis ? {
        plot_size: doc.analysis.plot_size,
        built_up_area: doc.analysis.built_up_area,
        bedrooms: doc.analysis.bedroom_count,
        bathrooms: doc.analysis.bathroom_count,
        floors: doc.analysis.floor_count,
        parking: doc.analysis.parking_spaces,
        garden_area: doc.analysis.garden_area,
        balcony_area: doc.analysis.balcony_area,
        pool: doc.analysis.pool_size,
        features: doc.analysis.features,
        rooms: doc.analysis.room_dimensions,
        summary: doc.analysis.summary,
      } : null,
    })) || []

    // Create system prompt
    const systemPrompt = `You are Smart AI, an intelligent document analysis assistant specializing in real estate documents including floor plans, plot maps, specifications, and brochures.

You have access to the following documents and their analyzed data:
${JSON.stringify(documentContext, null, 2)}

Your capabilities:
1. Compare properties - analyze sizes, features, and specifications
2. Calculate areas - total built-up area, plot sizes, room dimensions
3. Identify features - pools, gardens, parking, special amenities
4. Provide insights - investment potential, key differences, recommendations

Guidelines:
- Always reference specific document names when providing information
- Use exact numbers from the analysis data
- Format responses clearly with headers and bullet points
- Be helpful and provide actionable insights
- If information is not available in the documents, say so
- Keep responses concise but comprehensive`

    // Call OpenAI
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."
    const tokensUsed = completion.usage?.total_tokens || 0

    // Save messages to database
    const userMessageData = {
      user_id: userId,
      collection_id: collectionId || null,
      role: 'user',
      content: message,
      document_ids: documentIds || [],
      created_at: new Date().toISOString(),
    }

    const assistantMessageData = {
      user_id: userId,
      collection_id: collectionId || null,
      role: 'assistant',
      content: assistantMessage,
      document_ids: documentIds || [],
      model_used: 'gpt-4',
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("smart_chat_messages")
      .insert([userMessageData, assistantMessageData])

    return NextResponse.json({
      message: assistantMessage,
      tokens_used: tokensUsed,
    })
  } catch (error) {
    console.error("Error in smart chat:", error)

    // Fallback response if OpenAI fails
    return NextResponse.json({
      message: "I'm currently unable to process your request. This might be due to API limitations. Please try again later or check if OpenAI API key is configured.",
      tokens_used: 0,
    })
  }
}

// GET /api/smart/chat - Get chat history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get("collection_id")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("smart_chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (collectionId) {
      query = query.eq("collection_id", collectionId)
    }

    const { data: messages, error } = await query

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    )
  }
}

// DELETE /api/smart/chat - Clear chat history
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get("collection_id")

    const supabase = createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("smart_chat_messages")
      .delete()
      .eq("user_id", userId)

    if (collectionId) {
      query = query.eq("collection_id", collectionId)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    )
  }
}
