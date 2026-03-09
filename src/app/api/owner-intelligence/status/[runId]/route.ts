import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/demo-auth"
import { checkRunStatus } from "@/app/(dashboard)/owner-intelligence/_lib/apify"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ status: "UNAUTHORIZED" }, { status: 401 })
    }

    const { runId } = await params
    const status = await checkRunStatus(runId)
    return NextResponse.json({ status })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ status: "FAILED", error: "Status check failed" }, { status: 500 })
  }
}
