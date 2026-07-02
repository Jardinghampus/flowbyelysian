import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireApiUser } from "@/lib/api/guards"

export async function POST() {
  const guard = await requireApiUser()
  if (!guard.ok) return guard.response

  const cookieStore = await cookies()

  cookieStore.delete("gmail_access_token")
  cookieStore.delete("gmail_refresh_token")

  return NextResponse.json({ success: true })
}
