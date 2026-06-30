"use client"

import { createContext, useContext, ReactNode } from "react"

// Demo user data for demonstration purposes
const DEMO_USER = {
  id: "demo-user-001",
  firstName: "Demo",
  lastName: "User",
  fullName: "Demo User",
  primaryEmailAddress: {
    emailAddress: "jardinghampus@gmail.com", // Admin email for full demo access
  },
  imageUrl: null as string | null,
  publicMetadata: {
    phone: "+971 50 123 4567",
    brn: "00000",
    area: "tilal-al-ghaf",
    role: "admin",
  },
  update: async (data: { firstName?: string; lastName?: string }) => {
    // Mock update - in real app this would update the user
    console.log("Demo mode: User update simulated", data)
    return Promise.resolve()
  },
}

export type DemoUser = typeof DEMO_USER

interface DemoUserContextType {
  user: DemoUser | null
  isLoaded: boolean
  isSignedIn: boolean
  signOut: (options?: { redirectUrl?: string }) => void
}

const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined)

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const signOut = (options?: { redirectUrl?: string }) => {
    // For demo, just redirect to sign-in
    if (typeof window !== "undefined") {
      window.location.href = options?.redirectUrl || "/sign-in"
    }
  }

  return (
    <DemoUserContext.Provider
      value={{
        user: DEMO_USER,
        isLoaded: true,
        isSignedIn: true,
        signOut,
      }}
    >
      {children}
    </DemoUserContext.Provider>
  )
}

// Hook that mimics Clerk's useUser
export function useDemoUser() {
  const context = useContext(DemoUserContext)
  if (!context) {
    throw new Error("useDemoUser must be used within a DemoUserProvider")
  }
  return context
}

// Hook that mimics Clerk's useClerk
export function useDemoClerk() {
  const context = useContext(DemoUserContext)
  if (!context) {
    throw new Error("useDemoClerk must be used within a DemoUserProvider")
  }
  return {
    signOut: context.signOut,
  }
}

// Export the demo user ID for API routes
export const DEMO_USER_ID = "demo-user-001"
