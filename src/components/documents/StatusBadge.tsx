"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DocumentStatus } from "@/lib/documents/types"

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  },
  sent: {
    label: "Sent",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  signed: {
    label: "Signed",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  expired: {
    label: "Expired",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status] || statusConfig.draft

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  )
}
