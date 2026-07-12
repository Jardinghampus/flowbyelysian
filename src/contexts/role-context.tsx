"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type UserRole =
  | "admin"
  | "agent"
  | "buyer"
  | "seller"
  | "tenant"
  | "landlord"
  | "relocation_agent"

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
  canAccessSocial: boolean
  userEmail: string | null
  userId: string | null
  userName: string | null
  isLoaded: boolean
  canEditListing: (listingOwnerId: string, currentUserId: string) => boolean
  canDeleteListing: (listingOwnerId: string, currentUserId: string) => boolean
  refresh: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("agent")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [canAccessSocial, setCanAccessSocial] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (!res.ok) {
        setRole("agent")
        setUserEmail(null)
        setUserId(null)
        setUserName(null)
        setCanAccessSocial(false)
        return
      }

      const data = await res.json()
      const nextRole = data.user?.role === "admin" ? "admin" : "agent"
      setRole(nextRole)
      setUserEmail(data.user?.email || null)
      setUserId(data.user?.id || null)
      setUserName(data.user?.fullName || null)
      setCanAccessSocial(Boolean(data.user?.canAccessSocial))
    } catch {
      setCanAccessSocial(false)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

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
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin,
        isAgent,
        isInternal,
        isCustomer,
        isSeller,
        canCreateRequest,
        canAccessSocial,
        userEmail,
        userId,
        userName,
        isLoaded,
        canEditListing,
        canDeleteListing,
        refresh,
      }}
    >
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
