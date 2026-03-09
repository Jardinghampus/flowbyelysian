import { NextRequest, NextResponse } from "next/server"
import { checkRunStatus } from "@/app/(dashboard)/owner-intelligence/_lib/apify"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
    const status = await checkRunStatus(runId)
    return NextResponse.json({ status })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ status: "FAILED", error: "Status check failed" }, { status: 500 })
  }
}
