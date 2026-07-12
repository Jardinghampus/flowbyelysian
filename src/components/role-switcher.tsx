"use client"

import { useRole, getRoleLabel } from "@/contexts/role-context"
import { Badge } from "@/components/ui/badge"

/** Displays the signed-in role. Role switching is disabled in local auth. */
export function RoleSwitcher() {
  const { role, isInternal, isLoaded } = useRole()

  if (!isLoaded) return null

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
