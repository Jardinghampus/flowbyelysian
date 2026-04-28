import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-in-2(.*)",
  "/sign-up-2(.*)",
  "/sign-in-3(.*)",
  "/sign-up-3(.*)",
  "/forgot-password(.*)",
  "/errors(.*)",
  "/feature(.*)",
  "/properties(.*)",
  "/api/chat/inbound(.*)",
  "/api/mock/(.*)",
  "/api/news(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
