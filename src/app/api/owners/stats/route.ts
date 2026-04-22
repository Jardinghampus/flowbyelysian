import { NextRequest, NextResponse } from "next/server"
import { fetchOwnerStats } from "@/app/app/data/_lib/supabase-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = await fetchOwnerStats({
      area: searchParams.get("area") || undefined,
      status: searchParams.get("status") || undefined,
      agent: searchParams.get("agent") || undefined,
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
