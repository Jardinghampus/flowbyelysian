"use client"

import { useRole, type UserRole, getRoleLabel } from "@/contexts/role-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Building2, Key, Home, Briefcase } from "lucide-react"

const roleConfig: { value: UserRole; label: string; icon: React.ReactNode; category: string }[] = [
  { value: "admin", label: "Admin", icon: <Shield className="h-4 w-4" />, category: "Zaylo Staff" },
  { value: "agent", label: "Agent", icon: <Briefcase className="h-4 w-4" />, category: "Zaylo Staff" },
  { value: "buyer", label: "Buyer", icon: <User className="h-4 w-4" />, category: "Customer" },
  { value: "seller", label: "Seller", icon: <Building2 className="h-4 w-4" />, category: "Customer" },
  { value: "tenant", label: "Tenant", icon: <Home className="h-4 w-4" />, category: "Customer" },
  { value: "landlord", label: "Landlord", icon: <Key className="h-4 w-4" />, category: "Customer" },
  { value: "relocation_agent", label: "Relocation Agent", icon: <Briefcase className="h-4 w-4" />, category: "External" },
]

export function RoleSwitcher() {
  const { role, setRole, isInternal } = useRole()

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isInternal ? "default" : "secondary"} className="text-xs">
        {isInternal ? "Staff" : "Customer"}
      </Badge>
      <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Zaylo Staff</div>
          {roleConfig.filter(r => r.category === "Zaylo Staff").map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <span className="flex items-center gap-2">
                {r.icon}
                {r.label}
              </span>
            </SelectItem>
          ))}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-1">Customers</div>
          {roleConfig.filter(r => r.category === "Customer").map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <span className="flex items-center gap-2">
                {r.icon}
                {r.label}
              </span>
            </SelectItem>
          ))}
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-1">External</div>
          {roleConfig.filter(r => r.category === "External").map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <span className="flex items-center gap-2">
                {r.icon}
                {r.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
