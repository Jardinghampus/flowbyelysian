import { NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { getRateLimitStatus } from "@/app/app/owner-intelligence/_lib/rate-limit"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = getRateLimitStatus(userId)
    return NextResponse.json(status)
  } catch (error) {
    console.error("Usage error:", error)
    return NextResponse.json({ used: 0, limit: 50, remaining: 50 })
  }
}
