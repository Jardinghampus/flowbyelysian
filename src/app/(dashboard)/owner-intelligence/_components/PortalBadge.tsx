"use client"

import type { PortalType } from "@/types/owner-intelligence"
import { cn } from "@/lib/utils"

const portalConfig: Record<PortalType, { label: string; color: string; bg: string }> = {
  bayut: { label: "Bayut", color: "text-amber-400", bg: "bg-amber-400/10" },
  propertyfinder: { label: "PropertyFinder", color: "text-blue-400", bg: "bg-blue-400/10" },
  dubizzle: { label: "Dubizzle", color: "text-green-400", bg: "bg-green-400/10" },
  manual: { label: "Manual", color: "text-neutral-400", bg: "bg-neutral-400/10" },
}

export function PortalBadge({
  portal,
  className,
}: {
  portal: PortalType
  className?: string
}) {
  const config = portalConfig[portal]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded",
        config.color,
        config.bg,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.color.replace("text-", "bg-"))} />
      {config.label}
    </span>
  )
}
