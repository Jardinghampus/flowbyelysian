/** Routes and features reserved for Hampus only. Other users see them in the sidebar but cannot open them. */

export const HAMPUS_EMAIL = "hampus@zaylo.com"

export function isHampusEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return (
    normalized === HAMPUS_EMAIL ||
    normalized === "hampus" ||
    normalized.startsWith("hampus@")
  )
}

/** True when a sign-in form targets Hampus (alias or email). */
export function isHampusLoginAttempt(raw: string, normalizedEmail?: string) {
  if (isHampusEmail(raw)) return true
  const normalized = (normalizedEmail || raw).trim().toLowerCase()
  return normalized === HAMPUS_EMAIL
}

/** Page paths (and subpaths) that only Hampus may access. */
export const HAMPUS_ONLY_PATHS = [
  "/zaylo",
  "/app/data",
  "/app/calendar",
  "/app/deals",
  "/app/performance",
  "/app/owner-intelligence",
  "/app/market-statistics",
  "/app/mail",
  "/app/smart",
  "/app/ai-assistant",
  "/app/areas",
  "/app/seo-generator",
  "/app/training",
  "/app/pipeline",
  "/inloggade",
] as const

export function isHampusOnlyPath(pathname: string | null | undefined): boolean {
  const path = (pathname ?? "").split("?")[0].split("#")[0]
  return HAMPUS_ONLY_PATHS.some(
    (restricted) => path === restricted || path.startsWith(`${restricted}/`)
  )
}
