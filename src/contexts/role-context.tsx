"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export type UserRole = "admin" | "user"

// Admin email addresses with full rights
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
]

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAdmin: boolean
  userEmail: string | null
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const [role, setRole] = useState<UserRole>("user")

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress || ""
      const isAdminUser = ADMIN_EMAILS.includes(email.toLowerCase())
      setRole(isAdminUser ? "admin" : "user")
    }
  }, [isLoaded, user])

  const userEmail = user?.primaryEmailAddress?.emailAddress || null

  return (
    <RoleContext.Provider value={{ role, setRole, isAdmin: role === "admin", userEmail }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
