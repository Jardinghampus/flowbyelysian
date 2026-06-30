import type { PortalType } from "@/types/owner-intelligence"

const PORTAL_PATTERNS: { portal: PortalType; pattern: RegExp }[] = [
  { portal: "bayut", pattern: /bayut\.com/i },
  { portal: "propertyfinder", pattern: /propertyfinder\.ae/i },
  { portal: "dubizzle", pattern: /dubizzle\.com/i },
]

export function detectPortal(url: string): PortalType | null {
  for (const { portal, pattern } of PORTAL_PATTERNS) {
    if (pattern.test(url)) return portal
  }
  return null
}

export function isValidPortalUrl(url: string): boolean {
  return detectPortal(url) !== null
}
