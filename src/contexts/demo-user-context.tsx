"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type LocalUser = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  primaryEmailAddress: { emailAddress: string }
  imageUrl: string | null
  publicMetadata: {
    phone?: string
    brn?: string
    area?: string
    role: "admin" | "agent"
    canAccessSocial?: boolean
  }
  update: (data: { firstName?: string; lastName?: string }) => Promise<void>
}

interface LocalUserContextType {
  user: LocalUser | null
  isLoaded: boolean
  isSignedIn: boolean
  signOut: (options?: { redirectUrl?: string }) => void
}

const LocalUserContext = createContext<LocalUserContextType | undefined>(undefined)

function toLocalUser(data: {
  id: string
  email: string
  fullName: string
  role: "admin" | "agent"
  canAccessSocial?: boolean
}): LocalUser {
  const [firstName, ...rest] = data.fullName.split(" ")
  return {
    id: data.id,
    firstName: firstName || data.fullName,
    lastName: rest.join(" ") || "",
    fullName: data.fullName,
    primaryEmailAddress: { emailAddress: data.email },
    imageUrl: null,
    publicMetadata: {
      role: data.role,
      canAccessSocial: data.canAccessSocial,
    },
    update: async () => undefined,
  }
}

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          if (!cancelled) setUser(null)
          return
        }
        const data = await res.json()
        if (!cancelled && data.user) {
          setUser(
            toLocalUser({
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role === "admin" ? "admin" : "agent",
              canAccessSocial: data.user.canAccessSocial,
            })
          )
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const signOut = (options?: { redirectUrl?: string }) => {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      if (typeof window !== "undefined") {
        window.location.href = options?.redirectUrl || "/sign-in"
      }
    })
  }

  return (
    <LocalUserContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: Boolean(user),
        signOut,
      }}
    >
      {children}
    </LocalUserContext.Provider>
  )
}

export function useDemoUser() {
  const context = useContext(LocalUserContext)
  if (!context) {
    throw new Error("useDemoUser must be used within a DemoUserProvider")
  }
  return context
}

export function useDemoClerk() {
  const context = useContext(LocalUserContext)
  if (!context) {
    throw new Error("useDemoClerk must be used within a DemoUserProvider")
  }
  return {
    signOut: context.signOut,
  }
}

export const DEMO_USER_ID = "demo-user-001"
