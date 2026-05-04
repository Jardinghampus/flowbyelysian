"use client"

import { AlertTriangle, Clock, Plus } from "lucide-react"
import type { Owner, OwnerStatus, OwnerPriority } from "../_lib/types"
import { STATUS_CONFIG, PRIORITY_CONFIG } from "../_lib/types"
import { cn } from "@/lib/utils"
import { differenceInDays } from "date-fns"

interface TodoPanelProps {
  overdue: Owner[]
  dueSoon: Owner[]
  loading: boolean
  onOwnerClick: (owner: Owner) => void
  onSchedule: () => void
}

function TodoItem({ owner, isOverdue, onOwnerClick }: { owner: Owner; isOverdue: boolean; onOwnerClick: (o: Owner) => void }) {
  const days = owner.follow_up_at
    ? Math.abs(differenceInDays(new Date(owner.follow_up_at), new Date()))
    : 0

  return (
    <button
      onClick={() => onOwnerClick(owner)}
      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", PRIORITY_CONFIG[owner.priority as OwnerPriority]?.color)} />
        <span className="text-sm font-medium truncate flex-1">{owner.name}</span>
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded",
          isOverdue ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
        )}>
          {isOverdue ? `Overdue ${days}d` : days === 0 ? "Today" : `In ${days}d`}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 ml-4">
        <span className="text-xs text-muted-foreground">{owner.area}</span>
        {owner.bedrooms && <span className="text-xs text-muted-foreground">· {owner.bedrooms} BR</span>}
        {owner.unit_number && <span className="text-xs text-muted-foreground">· {owner.unit_number}</span>}
        <span className={cn(
          "ml-auto text-[10px] px-1.5 py-0.5 rounded-full border",
          STATUS_CONFIG[owner.status as OwnerStatus]?.bg,
          STATUS_CONFIG[owner.status as OwnerStatus]?.color,
        )}>
          {STATUS_CONFIG[owner.status as OwnerStatus]?.label}
        </span>
      </div>
    </button>
  )
}

export function TodoPanel({ overdue, dueSoon, loading, onOwnerClick, onSchedule }: TodoPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  const hasItems = overdue.length > 0 || dueSoon.length > 0

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No follow-ups scheduled</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Add follow-up dates to owners to see them here</p>
        <button
          onClick={onSchedule}
          className="mt-4 flex items-center gap-1.5 text-xs text-[#4B8EDB] hover:text-[#3A7DCB] font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Schedule a follow-up
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header button */}
      <div className="flex justify-end px-3 pb-1">
        <button
          onClick={onSchedule}
          className="flex items-center gap-1 text-xs text-[#4B8EDB] hover:text-[#3A7DCB] font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Schedule
        </button>
      </div>
      {/* Overdue section */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Overdue ({overdue.length})
            </span>
          </div>
          <div className="space-y-0.5">
            {overdue.map((owner) => (
              <TodoItem key={owner.id} owner={owner} isOverdue onOwnerClick={onOwnerClick} />
            ))}
          </div>
        </div>
      )}

      {/* Due soon section */}
      {dueSoon.length > 0 && (
        <div className={overdue.length > 0 ? "pt-2" : ""}>
          <div className="flex items-center gap-2 px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Due Soon ({dueSoon.length})
            </span>
          </div>
          <div className="space-y-0.5">
            {dueSoon.map((owner) => (
              <TodoItem key={owner.id} owner={owner} isOverdue={false} onOwnerClick={onOwnerClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
