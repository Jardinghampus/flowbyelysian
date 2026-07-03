import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isClerkAuthEnabled = process.env.AUTH_MODE === 'clerk'

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/user(.*)',
  '/zaylo(.*)',
  '/api/admin(.*)',
  '/api/ai(.*)',
  '/api/areas(.*)',
  '/api/contacts(.*)',
  '/api/crm(.*)',
  '/api/daily-activity(.*)',
  '/api/document-settings(.*)',
  '/api/documents(.*)',
  '/api/gmail(.*)',
  '/api/lead-scoring(.*)',
  '/api/listings(.*)',
  '/api/notifications(.*)',
  '/api/opportunities(.*)',
  '/api/outreach-logs(.*)',
  '/api/owner-intelligence(.*)',
  '/api/owners(.*)',
  '/api/pipeline-automations(.*)',
  '/api/reports(.*)',
  '/api/requests(.*)',
  '/api/sentiment(.*)',
  '/api/smart(.*)',
  '/api/stats(.*)',
  '/api/system(.*)',
  '/api/tasks(.*)',
  '/api/templates(.*)',
  '/api/title-deeds(.*)',
  '/api/training(.*)',
  '/api/user(.*)',
  '/api/zaylo(.*)',
])

const clerkAuthMiddleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export function middleware(request: NextRequest, event: Parameters<typeof clerkAuthMiddleware>[1]) {
  if (!isClerkAuthEnabled) {
    return NextResponse.next()
  }

  return clerkAuthMiddleware(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
