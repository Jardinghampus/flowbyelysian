import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_APP_URL + "/api/gmail/callback"
)

async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials.access_token
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get("gmail_access_token")?.value
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ error: "Not authenticated", connected: false }, { status: 401 })
  }

  // Try to refresh token if access token is missing
  if (!accessToken && refreshToken) {
    try {
      accessToken = await refreshAccessToken(refreshToken) ?? undefined
      if (accessToken) {
        cookieStore.set("gmail_access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 3600,
          path: "/",
        })
      }
    } catch {
      return NextResponse.json({ error: "Token refresh failed", connected: false }, { status: 401 })
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "No access token", connected: false }, { status: 401 })
  }

  oauth2Client.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: "v1", auth: oauth2Client })

  try {
    const searchParams = request.nextUrl.searchParams
    const maxResults = parseInt(searchParams.get("maxResults") || "50")
    const labelIds = searchParams.get("label") || "INBOX"

    // Fetch message list
    const messagesResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: [labelIds],
    })

    const messages = messagesResponse.data.messages || []

    // Fetch full message details for each message
    const fullMessages = await Promise.all(
      messages.slice(0, 50).map(async (msg) => {
        const fullMessage = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        })

        const headers = fullMessage.data.payload?.headers || []
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || ""

        // Get email body
        let body = ""
        const payload = fullMessage.data.payload

        if (payload?.body?.data) {
          body = Buffer.from(payload.body.data, "base64").toString("utf-8")
        } else if (payload?.parts) {
          const textPart = payload.parts.find(
            (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
          )
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8")
          }
        }

        // Parse sender name and email
        const fromHeader = getHeader("From")
        const emailMatch = fromHeader.match(/<(.+?)>/)
        const email = emailMatch ? emailMatch[1] : fromHeader
        const name = fromHeader.replace(/<.+?>/, "").trim().replace(/"/g, "") || email

        return {
          id: fullMessage.data.id,
          name,
          email,
          subject: getHeader("Subject") || "(No subject)",
          text: body.replace(/<[^>]*>/g, "").substring(0, 500), // Strip HTML, limit length
          date: new Date(parseInt(fullMessage.data.internalDate || "0")).toISOString(),
          read: !fullMessage.data.labelIds?.includes("UNREAD"),
          labels: fullMessage.data.labelIds || [],
        }
      })
    )

    // Get user profile
    const profile = await gmail.users.getProfile({ userId: "me" })

    return NextResponse.json({
      connected: true,
      email: profile.data.emailAddress,
      messages: fullMessages,
    })
  } catch (error) {
    console.error("Gmail API error:", error)
    return NextResponse.json({ error: "Failed to fetch messages", connected: false }, { status: 500 })
  }
}
