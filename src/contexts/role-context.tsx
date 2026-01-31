"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type UserRole = "admin" | "user"

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAdmin: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  // In production, this would come from Clerk user metadata or Supabase
  const [role, setRole] = useState<UserRole>("admin")

  return (
    <RoleContext.Provider value={{ role, setRole, isAdmin: role === "admin" }}>
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
