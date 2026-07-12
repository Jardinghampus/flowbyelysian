import { NextResponse } from "next/server"
import { getZayloState } from "@/lib/zaylo/control"
import { requireSocialAccess } from "@/lib/api/guards"

export async function GET() {
  try {
    const guard = await requireSocialAccess()
    if (!guard.ok) return guard.response

    return NextResponse.json(await getZayloState())
  } catch (error) {
    console.error("Failed to read Zaylo state", error)
    return NextResponse.json({ error: "Failed to read Zaylo state" }, { status: 500 })
  }
}
