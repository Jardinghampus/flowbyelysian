import { NextRequest } from "next/server"

/**
 * Returns the effective userId for mobile API requests.
 * Mobile requests send x-mobile-token (validated in middleware) plus
 * x-agent-id and x-agent-name headers for identity.
 */
export function getMobileUserId(request: NextRequest): string | null {
  const token = request.headers.get("x-mobile-token")
  if (!token || token !== process.env.MOBILE_API_TOKEN) return null
  return request.headers.get("x-agent-id") || "mobile-agent"
}

export function getMobileAgentName(request: NextRequest): string {
  return request.headers.get("x-agent-name") || "Mobile Agent"
}
