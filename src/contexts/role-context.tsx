"use client"

import { createContext, useContext, ReactNode, useState } from "react"

export type UserRole =
  | "admin"
  | "agent"
  | "buyer"
  | "seller"
  | "tenant"
  | "landlord"
  | "relocation_agent"

// These emails always get admin access regardless of publicMetadata
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
  "admin@admin.com",
]

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin"
    case "agent":
      return "Agent"
    case "buyer":
      return "Buyer"
    case "seller":
      return "Seller"
    case "tenant":
      return "Tenant"
    case "landlord":
      return "Landlord"
    case "relocation_agent":
      return "Relocation Agent"
    default:
      return role
  }
}

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isAdmin: boolean
  isAgent: boolean
  isInternal: boolean
  isCustomer: boolean
  isSeller: boolean
  canCreateRequest: boolean
  userEmail: string | null
  canEditListing: (listingOwnerId: string, currentUserId: string) => boolean
  canDeleteListing: (listingOwnerId: string, currentUserId: string) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin")
  const userEmail = ADMIN_EMAILS[0] ?? null
  const isAdmin = role === "admin"
  const isAgent = role === "agent"
  const isInternal = isAdmin || isAgent
  const isCustomer = !isInternal
  const isSeller = role === "seller" || role === "landlord"
  const canCreateRequest = true

  const canEditListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (isAdmin) return true
    if (isAgent) return listingOwnerId === currentUserId
    return false
  }

  const canDeleteListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (isAdmin) return true
    if (isAgent) return listingOwnerId === currentUserId
    return false
  }

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      isAdmin,
      isAgent,
      isInternal,
      isCustomer,
      isSeller,
      canCreateRequest,
      userEmail,
      canEditListing,
      canDeleteListing,
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export function isCustomerAllowedRoute(pathname: string | null | undefined): boolean {
  const path = (pathname ?? "").split("?")[0].split("#")[0]
  return (
    path === "/user/my-opportunities" ||
    path.startsWith("/user/my-opportunities/") ||
    path === "/user/settings" ||
    path.startsWith("/user/settings/")
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRole must be used within a RoleProvider")
  return context
}
