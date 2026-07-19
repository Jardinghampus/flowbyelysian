import { NextResponse } from "next/server"
import { requireApiUser } from "@/lib/api/guards"
import { getAgentProfilesByUserIds } from "@/lib/user-profile"

export async function GET(request: Request) {
  try {
    const guard = await requireApiUser()
    if (!guard.ok) return guard.response

    const { searchParams } = new URL(request.url)
    const ids = (searchParams.get("ids") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    if (!ids.length) {
      return NextResponse.json({ profiles: {} })
    }

    const map = await getAgentProfilesByUserIds(ids)
    const profiles = Object.fromEntries(map.entries())
    return NextResponse.json({ profiles })
  } catch (error) {
    console.error("Failed to load agent profiles:", error)
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 })
  }
}
