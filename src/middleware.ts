import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Demo mode: Authentication is simulated via demo-user-context.
// Role-based access is enforced at the component level using the RoleProvider.
//
// In production, this middleware would:
// 1. Verify JWT/session tokens
// 2. Check user roles from the token claims
// 3. Block access to protected routes server-side
//
// Route architecture:
//   /                    → Landing page (public)
//   /sign-in             → Auth pages (public)
//   /dashboard, etc.     → Authenticated app (all roles)
//   /market-updates      → Customer-only news feed (customer + admin preview)
//   /pipeline, /leads…   → ZFLOW agent platform (admin + agent only)
//   /admin               → Admin CMS & management (admin only)
//
// ZFLOW routes (agent-only internal tools):
const ZFLOW_ROUTES = [
  '/pipeline',
  '/leads',
  '/inventory',
  '/exchange',
  '/owner-intelligence',
  '/follow-up',
  '/mail',
  '/performance',
  '/smart',
  '/ai-assistant',
  '/seo-generator',
  '/description-writer',
  '/listing-video',
  '/training',
  '/news',
]

export function middleware(request: NextRequest) {
  // In demo mode, all requests pass through.
  // Role enforcement happens client-side via RoleProvider + useRole().
  // See ZFLOW_ROUTES above for the intended server-side blocking in production.
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
