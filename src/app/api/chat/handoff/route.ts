import { NextResponse } from "next/server"

export interface HandoffRequest {
  sessionId: string
  name: string
  phone: string
  context: string
  shownProperties?: string[]
}

export interface HandoffResponse {
  success: boolean
  leadId?: string
  error?: string
}

/**
 * POST /api/chat/handoff
 * Handle lead handoff to real estate agent
 */
export async function POST(request: Request): Promise<NextResponse<HandoffResponse>> {
  try {
    const body: HandoffRequest = await request.json()

    // Validate required fields
    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      )
    }

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      )
    }

    if (!body.phone || typeof body.phone !== "string") {
      return NextResponse.json(
        { success: false, error: "phone is required" },
        { status: 400 }
      )
    }

    console.log("[Handoff] New lead received:", {
      sessionId: body.sessionId,
      name: body.name,
      phone: body.phone,
      context: body.context,
      shownProperties: body.shownProperties,
    })

    // Generate lead ID
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Notify colleague/agent (mock endpoint in demo)
    try {
      const notifyUrl = new URL("/api/mock/notify", request.url).href
      await fetch(notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_lead",
          leadId,
          data: {
            name: body.name,
            phone: body.phone,
            context: body.context,
            shownProperties: body.shownProperties,
            timestamp: new Date().toISOString(),
            source: "whatsapp_bot",
          },
        }),
      })
    } catch (notifyError) {
      console.error("[Handoff] Notification error:", notifyError)
      // Don't fail the handoff if notification fails
    }

    // In production, you would:
    // 1. Save lead to database (Supabase)
    // 2. Send notification to assigned agent (email, WhatsApp, push)
    // 3. Create task in CRM
    // 4. Log analytics event

    /*
    // Example Supabase integration:
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: body.name,
        phone: body.phone,
        context: body.context,
        source: 'whatsapp_bot',
        session_id: body.sessionId,
        shown_properties: body.shownProperties,
        status: 'new',
        assigned_to: await getAvailableAgent(),
      })
      .select()
      .single()

    // Send WhatsApp notification to agent
    await sendWhatsAppMessage({
      to: agent.phone,
      text: `New lead from WhatsApp:\n${body.name}\n${body.phone}\nContext: ${body.context}`,
    })
    */

    console.log("[Handoff] Lead created successfully:", leadId)

    return NextResponse.json({
      success: true,
      leadId,
    })
  } catch (error) {
    console.error("[Handoff] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process handoff" },
      { status: 500 }
    )
  }
}
