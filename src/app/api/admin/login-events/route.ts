import { NextResponse } from "next/server"
import { requireHampusUser } from "@/lib/api/guards"
import { getTeamLoginStatus, listLoginEvents } from "@/lib/login-events"

export async function GET() {
  try {
    const guard = await requireHampusUser()
    if (!guard.ok) return guard.response

    const [team, events] = await Promise.all([getTeamLoginStatus(), listLoginEvents(200)])

    return NextResponse.json({ team, events })
  } catch (error) {
    console.error("Failed to load login events:", error)
    return NextResponse.json({ error: "Failed to load login events" }, { status: 500 })
  }
}
