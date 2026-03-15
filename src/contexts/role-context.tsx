"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

// Internal roles: admin & agent (Zaylo employees)
// Customer roles: buyer, seller, tenant, landlord, relocation_agent
export type UserRole =
  | "admin"
  | "agent"
  | "buyer"
  | "seller"
  | "tenant"
  | "landlord"
  | "relocation_agent"

// Grouped role categories for permission checks
export type RoleCategory = "internal" | "customer"

export function getRoleCategory(role: UserRole): RoleCategory {
  if (role === "admin" || role === "agent") return "internal"
  return "customer"
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    agent: "Agent",
    buyer: "Buyer",
    seller: "Seller",
    tenant: "Tenant",
    landlord: "Landlord",
    relocation_agent: "Relocation Agent",
  }
  return labels[role]
}

// Admin email addresses with full rights
const ADMIN_EMAILS = [
  "jardinghampus@gmail.com",
  "admin@admin.com",
]

// Agent email patterns - Zaylo employees
const AGENT_EMAILS = [
  "agent@agent.com",
]

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  roleCategory: RoleCategory
  isAdmin: boolean
  isAgent: boolean
  isInternal: boolean   // admin or agent (Zaylo staff)
  isCustomer: boolean   // buyer, seller, tenant, landlord, relocation_agent
  isSeller: boolean     // seller or landlord (can list properties)
  isBuyer: boolean      // buyer or tenant (searching for properties)
  isRelocationAgent: boolean
  userEmail: string | null
  canEditListing: (listingOwnerId: string, currentUserId: string) => boolean
  canDeleteListing: (listingOwnerId: string, currentUserId: string) => boolean
  canCreateListing: boolean
  canViewPerformance: boolean
  canViewAdmin: boolean
  canCreateRequest: boolean
  canViewMarketUpdates: boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  // Demo mode: Default to admin role for full demo access
  const [role, setRole] = useState<UserRole>("admin")
  const [userEmail, setUserEmail] = useState<string | null>("jardinghampus@gmail.com")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Demo mode: Set admin role immediately
    setRole("admin")
    setUserEmail("jardinghampus@gmail.com")
  }, [])

  const roleCategory = getRoleCategory(role)
  const isInternal = roleCategory === "internal"
  const isCustomer = roleCategory === "customer"

  // Permission helpers
  const canEditListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true
    if (role === "agent") return listingOwnerId === currentUserId
    // Sellers/landlords can edit their own listings
    if (role === "seller" || role === "landlord") return listingOwnerId === currentUserId
    return false
  }

  const canDeleteListing = (listingOwnerId: string, currentUserId: string): boolean => {
    if (role === "admin") return true
    if (role === "agent") return listingOwnerId === currentUserId
    if (role === "seller" || role === "landlord") return listingOwnerId === currentUserId
    return false
  }

  // Sellers, landlords, agents, and admins can create listings
  const canCreateListing = ["admin", "agent", "seller", "landlord"].includes(role)

  // Only internal staff can see performance/analytics
  const canViewPerformance = isInternal

  // Only admins see the admin panel
  const canViewAdmin = role === "admin"

  // Buyers, tenants, relocation agents, and internal staff can create requests/searches
  const canCreateRequest = ["admin", "agent", "buyer", "tenant", "relocation_agent"].includes(role)

  // Market Updates: visible to customers + admin (for preview/management)
  const canViewMarketUpdates = isCustomer || role === "admin"

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      roleCategory,
      isAdmin: role === "admin",
      isAgent: role === "agent",
      isInternal,
      isCustomer,
      isSeller: role === "seller" || role === "landlord",
      isBuyer: role === "buyer" || role === "tenant",
      isRelocationAgent: role === "relocation_agent",
      userEmail,
      canEditListing,
      canDeleteListing,
      canCreateListing,
      canViewPerformance,
      canViewAdmin,
      canCreateRequest,
      canViewMarketUpdates,
    }}>
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
