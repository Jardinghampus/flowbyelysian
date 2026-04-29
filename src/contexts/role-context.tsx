"use client"

import { createContext, useContext, ReactNode, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"

export type UserRole =
  | "admin"
  | "agent"
  | "user"
  | "buyer"
  | "seller"
  | "tenant"
  | "landlord"
  | "relocation_agent"

const INTERNAL_ROLES: UserRole[] = ["admin", "agent"]
const CUSTOMER_ROLES: UserRole[] = ["buyer", "seller", "tenant", "landlord", "relocation_agent", "user"]

// Routes customers are allowed to access under /user/
const CUSTOMER_ALLOWED_ROUTES = ["/user/my-opportunities", "/user/settings"]

export function isCustomerAllowedRoute(pathname: string): boolean {
  return CUSTOMER_ALLOWED_ROUTES.some((route) => pathname.startsWith(route))
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    agent: "Agent",
    user: "User",
    buyer: "Buyer",
    seller: "Seller",
    tenant: "Tenant",
    landlord: "Landlord",
    relocation_agent: "Relocation Agent",
  }
  return labels[role] ?? role
}

// These emails always get admin access regardless of publicMetadata
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
  "admin@admin.com",
]

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
  const { user } = useUser()

  const clerkRole = useMemo<UserRole>(() => {
    const email = user?.primaryEmailAddress?.emailAddress
    if (email && ADMIN_EMAILS.includes(email)) return "admin"
    const metaRole = user?.publicMetadata?.role as string | undefined
    if (metaRole === "admin") return "admin"
    if (metaRole === "agent") return "agent"
    return "user"
  }, [user])

  // Allow local role override for impersonation/debug (resets on reload)
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null)

  const role: UserRole = roleOverride ?? clerkRole

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null

  const isAdmin = role === "admin"
  const isAgent = role === "agent"
  const isInternal = INTERNAL_ROLES.includes(role)
  const isCustomer = CUSTOMER_ROLES.includes(role)
  const isSeller = role === "seller"
  const canCreateRequest = isInternal || role === "buyer" || role === "tenant" || role === "relocation_agent"

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
      setRole: setRoleOverride,
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

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error("useRole must be used within a RoleProvider")
  return context
}
