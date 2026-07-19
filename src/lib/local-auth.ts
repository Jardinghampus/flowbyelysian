import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export const LOCAL_SESSION_COOKIE = "flow_session"
const SESSION_DAYS = 14

export type LocalRole = "admin" | "agent"

export type AppUserRow = {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: LocalRole
  can_access_social: boolean
  status: "active" | "disabled"
  must_change_password?: boolean
  created_at: string
  updated_at: string
}

export type LocalSessionUser = {
  id: string
  email: string
  fullName: string
  role: LocalRole
  canAccessSocial: boolean
  mustChangePassword?: boolean
}

type SessionPayload = {
  sub: string
  email: string
  name: string
  role: LocalRole
  social: boolean
  exp: number
}

function sessionSecret() {
  const secret =
    process.env.LOCAL_AUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) {
    throw new Error("LOCAL_AUTH_SECRET (or SUPABASE_SERVICE_ROLE_KEY) is required for local auth")
  }

  return secret
}

function b64url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input
  return buf.toString("base64url")
}

function signBody(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url")
}

function signPayload(payload: SessionPayload) {
  const body = b64url(JSON.stringify(payload))
  return `${body}.${signBody(body)}`
}

function verifyToken(token: string): SessionPayload | null {
  const [body, sig] = token.split(".")
  if (!body || !sig) return null

  const expected = signBody(body)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload
    if (!payload?.sub || !payload.exp || Date.now() > payload.exp) return null
    if (payload.role !== "admin" && payload.role !== "agent") return null
    return payload
  } catch {
    return null
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [algo, salt, hash] = stored.split("$")
  if (algo !== "scrypt" || !salt || !hash) return false

  const next = scryptSync(password, salt, 64)
  const prev = Buffer.from(hash, "hex")
  if (next.length !== prev.length) return false
  return timingSafeEqual(next, prev)
}

export function createSessionToken(user: LocalSessionUser) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role,
    social: user.canAccessSocial,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  }
  return signPayload(payload)
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  }
}

export function toSessionUser(row: AppUserRow): LocalSessionUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    canAccessSocial: row.can_access_social,
    mustChangePassword: Boolean(row.must_change_password),
  }
}

export function toClerkShapedUser(user: LocalSessionUser) {
  const [firstName, ...rest] = user.fullName.split(" ")
  return {
    id: user.id,
    firstName: firstName || user.fullName,
    lastName: rest.join(" ") || "",
    fullName: user.fullName,
    emailAddresses: [{ emailAddress: user.email }],
    primaryEmailAddress: { emailAddress: user.email },
    publicMetadata: {
      role: user.role,
      canAccessSocial: user.canAccessSocial,
    },
    privateMetadata: {},
    imageUrl: null,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  }
}

async function appUsersTable() {
  const supabase = createServerClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from("app_users")
}

export async function findUserByEmail(email: string): Promise<AppUserRow | null> {
  const table = await appUsersTable()
  const { data, error } = await table
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle()

  if (error) throw error
  return data as AppUserRow | null
}

export async function findUserById(id: string): Promise<AppUserRow | null> {
  const table = await appUsersTable()
  const { data, error } = await table.select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as AppUserRow | null
}

export async function listAppUsers(): Promise<AppUserRow[]> {
  const table = await appUsersTable()
  const { data, error } = await table
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data || []) as AppUserRow[]
}

export async function countAppUsers(): Promise<number> {
  const table = await appUsersTable()
  const { count, error } = await table.select("id", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}

export async function createAppUser(input: {
  email: string
  password: string
  fullName: string
  role: LocalRole
  canAccessSocial?: boolean
  mustChangePassword?: boolean
}) {
  const table = await appUsersTable()
  const row = {
    email: input.email.trim().toLowerCase(),
    password_hash: hashPassword(input.password),
    full_name: input.fullName.trim(),
    role: input.role,
    can_access_social: Boolean(input.canAccessSocial),
    status: "active",
    must_change_password: input.mustChangePassword !== false,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await table.insert(row).select("*").single()
  if (error) throw error
  return data as AppUserRow
}

export async function deleteAppUser(id: string) {
  const table = await appUsersTable()
  const { error } = await table.delete().eq("id", id)
  if (error) throw error
}

export async function updateAppUser(
  id: string,
  patch: Partial<{
    full_name: string
    role: LocalRole
    can_access_social: boolean
    status: "active" | "disabled"
    password: string
    must_change_password: boolean
  }>
) {
  const table = await appUsersTable()
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (patch.full_name !== undefined) update.full_name = patch.full_name
  if (patch.role !== undefined) update.role = patch.role
  if (patch.can_access_social !== undefined) update.can_access_social = patch.can_access_social
  if (patch.status !== undefined) update.status = patch.status
  if (patch.must_change_password !== undefined) update.must_change_password = patch.must_change_password
  if (patch.password) {
    update.password_hash = hashPassword(patch.password)
    update.must_change_password = patch.must_change_password ?? false
  }

  const { data, error } = await table.update(update).eq("id", id).select("*").single()
  if (error) throw error
  return data as AppUserRow
}

export async function readSessionFromCookie(): Promise<LocalSessionUser | null> {
  const jar = await cookies()
  const token = jar.get(LOCAL_SESSION_COOKIE)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.name,
    role: payload.role,
    canAccessSocial: payload.social,
  }
}

export async function getVerifiedSessionUser(): Promise<LocalSessionUser | null> {
  const session = await readSessionFromCookie()
  if (!session) return null

  const row = await findUserById(session.id)
  if (!row || row.status !== "active") return null

  return toSessionUser(row)
}

const DEFAULT_BOOTSTRAP_EMAIL = "hampus@zaylo.com"

export function normalizeLoginEmail(raw: string) {
  const value = raw.trim().toLowerCase()
  if (value === "hampus") return DEFAULT_BOOTSTRAP_EMAIL
  return value
}

/**
 * First login with an empty user table creates Hampus as admin + social access.
 * Subsequent logins require an existing account.
 */
export async function bootstrapAdminIfEmpty(email: string, password: string) {
  const existing = await countAppUsers()
  if (existing > 0) return null

  const normalized = normalizeLoginEmail(email)
  const bootstrapEmail = (process.env.LOCAL_BOOTSTRAP_EMAIL || DEFAULT_BOOTSTRAP_EMAIL).toLowerCase()
  const isHampus =
    normalized === bootstrapEmail || normalized.startsWith("hampus@")

  if (!isHampus) {
    throw new Error("First setup: sign in as Hampus to create the admin account.")
  }

  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters.")
  }

  return createAppUser({
    email: bootstrapEmail,
    password,
    fullName: process.env.LOCAL_BOOTSTRAP_NAME || "Hampus",
    role: "admin",
    canAccessSocial: true,
  })
}
