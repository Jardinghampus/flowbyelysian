import { NextResponse } from "next/server"
import { LOCAL_SESSION_COOKIE, sessionCookieOptions } from "@/lib/local-auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(LOCAL_SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  })
  return response
}
