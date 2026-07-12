export type AuthMode = "local" | "clerk" | "demo"

const raw = (process.env.AUTH_MODE || "local").toLowerCase()

export const authMode: AuthMode =
  raw === "clerk" ? "clerk" : raw === "demo" ? "demo" : "local"

export const isClerkAuthEnabled = authMode === "clerk"
export const isLocalAuthEnabled = authMode === "local"
export const isDemoAuthEnabled = authMode === "demo"
