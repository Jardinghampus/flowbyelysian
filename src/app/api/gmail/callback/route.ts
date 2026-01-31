import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_APP_URL + "/api/gmail/callback"
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL("/mail?error=" + encodeURIComponent(error), process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/mail?error=no_code", process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)

    const cookieStore = await cookies()

    // Store tokens in secure HTTP-only cookies
    cookieStore.set("gmail_access_token", tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    })

    if (tokens.refresh_token) {
      cookieStore.set("gmail_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    }

    return NextResponse.redirect(
      new URL("/mail?connected=true", process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (err) {
    console.error("Error getting tokens:", err)
    return NextResponse.redirect(
      new URL("/mail?error=token_error", process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}
