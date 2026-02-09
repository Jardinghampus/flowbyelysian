import { NextResponse } from "next/server"

export interface NotifyRequest {
  type: "new_lead" | "message" | "alert"
  leadId?: string
  data: {
    name?: string
    phone?: string
    context?: string
    shownProperties?: string[]
    timestamp?: string
    source?: string
    message?: string
  }
}

export interface NotifyResponse {
  success: boolean
  notificationId?: string
  error?: string
}

// In-memory storage for demo notifications (replace with real notification service)
const notifications: Array<{
  id: string
  type: string
  data: NotifyRequest["data"]
  createdAt: Date
}> = []

/**
 * POST /api/mock/notify
 * Mock notification endpoint for demo purposes
 * In production, this would send real notifications (email, SMS, push, WhatsApp)
 */
export async function POST(request: Request): Promise<NextResponse<NotifyResponse>> {
  try {
    const body: NotifyRequest = await request.json()

    const notificationId = `notify-${Date.now()}`

    // Log notification for debugging
    console.log("=".repeat(60))
    console.log("[NOTIFICATION RECEIVED]")
    console.log("=".repeat(60))
    console.log("Type:", body.type)
    console.log("Lead ID:", body.leadId)
    console.log("Data:", JSON.stringify(body.data, null, 2))
    console.log("Timestamp:", new Date().toISOString())
    console.log("=".repeat(60))

    // Store notification
    notifications.push({
      id: notificationId,
      type: body.type,
      data: body.data,
      createdAt: new Date(),
    })

    // In production, implement actual notifications:
    /*
    // Send email notification
    await sendEmail({
      to: "agent@elysian.ae",
      subject: `New Lead: ${body.data.name}`,
      body: `
        New lead from WhatsApp Bot

        Name: ${body.data.name}
        Phone: ${body.data.phone}
        Context: ${body.data.context}
        Properties viewed: ${body.data.shownProperties?.join(", ")}

        Please follow up within 10 minutes.
      `,
    })

    // Send WhatsApp to agent
    await sendWhatsAppMessage({
      to: agent.phone,
      text: `New lead: ${body.data.name} (${body.data.phone})`,
    })

    // Create Supabase notification
    await supabase.from('notifications').insert({
      user_id: agent.id,
      type: 'lead',
      title: 'New Lead from WhatsApp',
      message: `${body.data.name} is interested in properties`,
      link: `/leads/${body.leadId}`,
    })
    */

    return NextResponse.json({
      success: true,
      notificationId,
    })
  } catch (error) {
    console.error("[Mock Notify] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mock/notify
 * Get recent notifications (for debugging)
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    notifications: notifications.slice(-20), // Last 20 notifications
    total: notifications.length,
  })
}
