"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Brain, Kanban, GraduationCap, Sparkles, Lock, ArrowRight } from "lucide-react"
import { isHampusEmail } from "@/lib/hampus-access"
import { useRole } from "@/contexts/role-context"
import { TEAM_COLOR } from "@/lib/brand"
import { cn } from "@/lib/utils"

type FomoSignals = {
  descriptionsThisWeek: number
  dealsThisWeek: number
  pipelineTotal: number
  activeAgents: number
  trainingProgress: { done: number; total: number }
  recentToolActivity: Array<{
    event_type: string
    title: string
    area_name: string
    actor_name: string
    created_at: string
  }>
}

const teasers = [
  {
    key: "description",
    label: "Description Generator",
    href: "/app/seo-generator",
    icon: Sparkles,
    stat: (s: FomoSignals) => `${Math.max(s.descriptionsThisWeek, 1)} this week`,
    hint: "AI listing copy in seconds",
  },
  {
    key: "deals",
    label: "Deal Board",
    href: "/app/pipeline",
    icon: Kanban,
    stat: (s: FomoSignals) => `${s.pipelineTotal || s.dealsThisWeek} in pipeline`,
    hint: "Track offers & closings",
  },
  {
    key: "training",
    label: "Training",
    href: "/app/training",
    icon: GraduationCap,
    stat: (s: FomoSignals) => `${s.trainingProgress.done}/${s.trainingProgress.total} modules`,
    hint: "Broker playbooks & scripts",
  },
  {
    key: "smart",
    label: "Smart Docs",
    href: "/app/smart",
    icon: Brain,
    stat: () => "Document AI",
    hint: "Analyze contracts & brochures",
  },
]

export function PremiumTeasers() {
  const { userEmail } = useRole()
  const isHampus = isHampusEmail(userEmail)
  const [signals, setSignals] = useState<FomoSignals | null>(null)

  useEffect(() => {
    fetch("/api/fomo-signals")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSignals(data))
      .catch(() => {})
  }, [])

  if (!signals) return null

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: `${TEAM_COLOR}22`, background: `${TEAM_COLOR}08` }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Early access tools
        </span>
        {!isHampus ? (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" /> Preview mode
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40">
        {teasers.map((item) => {
          const Icon = item.icon
          const inner = (
            <div
              className={cn(
                "flex flex-col gap-2 bg-card p-3 h-full transition-colors",
                !isHampus && "opacity-90"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-4 w-4" style={{ color: TEAM_COLOR }} />
                {!isHampus ? <Lock className="h-3 w-3 text-muted-foreground/50" /> : null}
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.hint}</p>
              </div>
              <p className="text-sm font-mono font-bold mt-auto" style={{ color: TEAM_COLOR }}>
                {item.stat(signals)}
              </p>
            </div>
          )

          if (isHampus) {
            return (
              <Link key={item.key} href={item.href} className="hover:bg-muted/30 transition-colors">
                {inner}
              </Link>
            )
          }

          return (
            <div
              key={item.key}
              className="cursor-not-allowed relative"
              title="Early access — not enabled for your account yet"
            >
              {inner}
            </div>
          )
        })}
      </div>

      {signals.recentToolActivity.length > 0 ? (
        <div className="border-t border-border/50 px-3 py-2 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Team activity</p>
          {signals.recentToolActivity.slice(0, 3).map((row, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/80 shrink-0">{row.actor_name}</span>
              <span className="truncate flex-1">{row.title}</span>
              <ArrowRight className="h-3 w-3 shrink-0 opacity-40" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
