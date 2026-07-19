import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { LOCAL_SESSION_COOKIE, parseSessionToken } from "@/lib/local-auth-edge"
import { isHampusEmail, isHampusOnlyPath } from "@/lib/hampus-access"

const authMode = (process.env.AUTH_MODE || "local").toLowerCase()
const isClerkAuthEnabled = authMode === "clerk"
const isLocalAuthEnabled = authMode !== "clerk" && authMode !== "demo"

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/user(.*)",
  "/dashboard(.*)",
  "/zaylo(.*)",
  "/inventory(.*)",
  "/pipeline(.*)",
  "/api/admin(.*)",
  "/api/ai(.*)",
  "/api/areas(.*)",
  "/api/contacts(.*)",
  "/api/crm(.*)",
  "/api/daily-activity(.*)",
  "/api/deals(.*)",
  "/api/calendar(.*)",
  "/api/document-settings(.*)",
  "/api/documents(.*)",
  "/api/gmail(.*)",
  "/api/lead-scoring(.*)",
  "/api/listings(.*)",
  "/api/market-listings(.*)",
  "/api/market-transactions(.*)",
  "/api/performance(.*)",
  "/api/notifications(.*)",
  "/api/opportunities(.*)",
  "/api/outreach-logs(.*)",
  "/api/owner-intelligence(.*)",
  "/api/owners(.*)",
  "/api/pipeline-automations(.*)",
  "/api/reports(.*)",
  "/api/requests(.*)",
  "/api/sentiment(.*)",
  "/api/smart(.*)",
  "/api/stats(.*)",
  "/api/system(.*)",
  "/api/tasks(.*)",
  "/api/templates(.*)",
  "/api/title-deeds(.*)",
  "/api/training(.*)",
  "/api/user(.*)",
  "/api/zaylo(.*)",
])

const isPublicAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/change-password(.*)",
  "/api/auth(.*)",
  "/api/webhooks(.*)",
  "/sign/(.*)",
  "/share/(.*)",
  "/api/listing-share/(.*)",
  "/api/cron/(.*)",
])

const isSocialRoute = createRouteMatcher([
  "/zaylo(.*)",
  "/api/zaylo(.*)",
  "/app/settings/connections(.*)",
  "/settings/connections(.*)",
  "/user/settings/connections(.*)",
])

const clerkAuthMiddleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return NextResponse.next()
})

async function localAuthMiddleware(request: NextRequest) {
  if (isPublicAuthRoute(request)) {
    return NextResponse.next()
  }

  if (!isProtectedRoute(request)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(LOCAL_SESSION_COOKIE)?.value
  const session = await parseSessionToken(token)

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isSocialRoute(request) && !session.canAccessSocial) {
    const url = request.nextUrl.clone()
    url.pathname = "/app/dashboard"
    url.searchParams.set("error", "social-restricted")
    return NextResponse.redirect(url)
  }

  if (isHampusOnlyPath(request.nextUrl.pathname) && !isHampusEmail(session.email)) {
    const url = request.nextUrl.clone()
    url.pathname = "/app/dashboard"
    url.searchParams.set("error", "hampus-only")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export async function middleware(request: NextRequest, event: Parameters<typeof clerkAuthMiddleware>[1]) {
  if (isLocalAuthEnabled) {
    return localAuthMiddleware(request)
  }

  if (!isClerkAuthEnabled) {
    return NextResponse.next()
  }

  return clerkAuthMiddleware(request, event)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
