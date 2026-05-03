"use client"

import { Users, Phone, MessageSquare, Clock, AlertTriangle } from "lucide-react"
import type { OwnerStats } from "../_lib/types"
import { cn } from "@/lib/utils"

interface StatsBarProps {
  stats: OwnerStats
  loading: boolean
}

const cards = [
  { key: "totalOwners" as const, label: "Total Owners", icon: Users, accent: "text-[#4B8EDB]" },
  { key: "callsLast7Days" as const, label: "Calls (7d)", icon: Phone, accent: "text-blue-400" },
  { key: "whatsappLast7Days" as const, label: "WhatsApp (7d)", icon: MessageSquare, accent: "text-emerald-400" },
  { key: "consideringCount" as const, label: "Considering", icon: Clock, accent: "text-amber-400" },
  { key: "overdueFollowUps" as const, label: "Overdue", icon: AlertTriangle, accent: "text-red-400" },
]

export function StatsBar({ stats, loading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const isOverdue = card.key === "overdueFollowUps" && value > 0

        return (
          <div
            key={card.key}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 transition-colors",
              "bg-background/50 border-border/50 hover:border-border",
              isOverdue && "border-red-500/30 bg-red-500/5"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={cn("h-4 w-4", card.accent)} />
              {isOverdue && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold tracking-tight">
                {loading ? (
                  <span className="inline-block h-7 w-12 rounded bg-muted animate-pulse" />
                ) : (
                  value.toLocaleString()
                )}
              </p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
