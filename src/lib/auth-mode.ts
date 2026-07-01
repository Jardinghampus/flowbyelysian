export const authMode = process.env.AUTH_MODE === "clerk" ? "clerk" : "demo"

export const isClerkAuthEnabled = authMode === "clerk"
