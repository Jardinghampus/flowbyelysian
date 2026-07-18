"use client"

import { useRole, getRoleLabel, type UserRole } from "@/contexts/role-context"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SWITCH_EMAILS = new Set([
  "hampus@flowbyelysian.com",
  "laura@flowbyelysian.com",
])

const VIEW_ROLE_KEY = "zaylo_view_role"

/** Hampus/Laura can switch Admin ↔ Agent view. Others see badge only. */
export function RoleSwitcher() {
  const { role, setRole, isInternal, isLoaded, userEmail } = useRole()

  if (!isLoaded) return null

  const canSwitch = Boolean(userEmail && SWITCH_EMAILS.has(userEmail.toLowerCase()))

  if (!canSwitch) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isInternal ? "default" : "secondary"} className="text-xs">
          {isInternal ? "Staff" : "Customer"}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {getRoleLabel(role)}
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default" className="text-xs">
        Switch
      </Badge>
      <Select
        value={role === "admin" || role === "agent" ? role : "admin"}
        onValueChange={(value) => {
          const next = value as UserRole
          setRole(next)
          try {
            localStorage.setItem(VIEW_ROLE_KEY, next)
          } catch {
            // ignore
          }
        }}
      >
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="agent">Agent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function restoreSwitchedRole(email: string | null, dbRole: UserRole): UserRole {
  if (!email || !SWITCH_EMAILS.has(email.toLowerCase()) || dbRole !== "admin") return dbRole
  try {
    const saved = localStorage.getItem(VIEW_ROLE_KEY)
    if (saved === "admin" || saved === "agent") return saved
  } catch {
    // ignore
  }
  return dbRole
}
