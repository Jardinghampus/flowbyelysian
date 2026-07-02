import { NextRequest, NextResponse } from "next/server"
import { startZayloJob, type ZayloJob } from "@/lib/zaylo/control"
import { requireApiUser } from "@/lib/api/guards"

const allowedJobs = new Set<ZayloJob>(["scrape-listings", "generate-week", "build-zaylo", "import-pdfs"])

export async function POST(request: NextRequest) {
  try {
    const guard = await requireApiUser({ roles: ["admin", "manager", "operator"] })
    if (!guard.ok) return guard.response

    const body = (await request.json()) as { job?: string }
    const job = body.job as ZayloJob | undefined

    if (!job || !allowedJobs.has(job)) {
      return NextResponse.json({ error: "Unsupported Zaylo job" }, { status: 400 })
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error: "Zaylo jobs must run on the dedicated worker server, not inside Vercel.",
          job,
          workerRequired: true,
        },
        { status: 409 }
      )
    }

    const run = await startZayloJob(job)
    return NextResponse.json({ run }, { status: 202 })
  } catch (error) {
    console.error("Failed to start Zaylo job", error)
    return NextResponse.json({ error: "Failed to start Zaylo job" }, { status: 500 })
  }
}
