"use client"

import type { PortalType } from "@/types/owner-intelligence"
import { cn } from "@/lib/utils"

const portalConfig: Record<PortalType, { label: string; color: string; bg: string }> = {
  bayut: { label: "Bayut", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
  propertyfinder: { label: "PropertyFinder", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
  dubizzle: { label: "Dubizzle", color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/15" },
  manual: { label: "Manual", color: "text-neutral-600 dark:text-neutral-400", bg: "bg-neutral-100 dark:bg-neutral-500/15" },
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
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded",
        config.color,
        config.bg,
        className
      )}
    >
      {config.label}
    </span>
  )
}
