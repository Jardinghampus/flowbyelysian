/**
 * Edge-safe session parsing for middleware (Web Crypto, no Node-only APIs).
 */
export const LOCAL_SESSION_COOKIE = "flow_session"

type SessionPayload = {
  sub: string
  email: string
  name: string
  role: "admin" | "agent"
  social: boolean
  exp: number
}

export type EdgeSessionUser = {
  id: string
  email: string
  fullName: string
  role: "admin" | "agent"
  canAccessSocial: boolean
}

function sessionSecret() {
  return (
    process.env.LOCAL_AUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  )
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ""
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]!)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

async function hmacSign(body: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body))
  return bytesToBase64Url(sig)
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  const secret = sessionSecret()
  if (!secret) return null

  const [body, sig] = token.split(".")
  if (!body || !sig) return null

  const expected = await hmacSign(body, secret)
  if (expected.length !== sig.length) return null

  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  if (mismatch !== 0) return null

  try {
    const json = atob(body.replace(/-/g, "+").replace(/_/g, "/"))
    const payload = JSON.parse(json) as SessionPayload
    if (!payload?.sub || !payload.exp || Date.now() > payload.exp) return null
    if (payload.role !== "admin" && payload.role !== "agent") return null
    return payload
  } catch {
    return null
  }
}

export async function parseSessionToken(
  token: string | undefined | null
): Promise<EdgeSessionUser | null> {
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.name,
    role: payload.role,
    canAccessSocial: payload.social,
  }
}
