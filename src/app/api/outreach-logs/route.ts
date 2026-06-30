import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@/lib/demo-auth"
import { createOutreachLog, updateOwner } from "@/app/app/data/_lib/supabase-queries"
import { logOutreachSchema } from "@/app/app/data/_lib/schemas"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()
    const parsed = logOutreachSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { follow_up_days, follow_up_date, ...logData } = parsed.data

    let follow_up_set_to: string | null = null
    if (follow_up_date) {
      follow_up_set_to = new Date(follow_up_date).toISOString()
    } else if (follow_up_days) {
      follow_up_set_to = new Date(Date.now() + follow_up_days * 24 * 60 * 60 * 1000).toISOString()
    }

    const log = await createOutreachLog({
      ...logData,
      agent_id: userId,
      agent_name: user?.fullName || "Unknown",
      follow_up_set_to,
      outcome: logData.outcome || null,
      status_changed_to: logData.status_changed_to || null,
    } as never)

    const ownerUpdates: Record<string, unknown> = {}
    if (logData.status_changed_to) {
      ownerUpdates.status = logData.status_changed_to
    }
    if (follow_up_set_to) {
      ownerUpdates.follow_up_at = follow_up_set_to
    }

    if (Object.keys(ownerUpdates).length > 0) {
      await updateOwner(logData.owner_id, ownerUpdates as never)
    }

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error("Error creating outreach log:", error)
    return NextResponse.json({ error: "Failed to log outreach" }, { status: 500 })
  }
}
