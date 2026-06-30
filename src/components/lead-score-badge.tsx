"use client"

import { useMemo } from "react"
import { Flame, ThermometerSun, Snowflake, TrendingUp, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { scoreLeadConversion, type LeadScoreInput, type LeadScoreResult } from "@/lib/lead-scoring"

interface LeadScoreBadgeProps {
  opportunity: {
    type: string
    status: string
    full_name: string
    email: string | null
    phone: string | null
    whatsapp: string | null
    preferred_contact: string | null
    area: string | null
    property_type: string | null
    bedrooms: number | null
    size: number | null
    price: number | null
    min_price: number | null
    max_price: number | null
    features: string[]
    notes: string | null
    market_comparison_pct: number | null
    created_at: string
    updated_at: string
  }
  showInsights?: boolean
  compact?: boolean
}

const tierConfig = {
  hot: {
    label: "Hot",
    icon: Flame,
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-500/30",
    gradient: "from-red-500 to-orange-500",
  },
  warm: {
    label: "Warm",
    icon: ThermometerSun,
    bg: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/30",
    gradient: "from-amber-500 to-yellow-500",
  },
  cold: {
    label: "Cold",
    icon: Snowflake,
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-500/30",
    gradient: "from-blue-500 to-cyan-500",
  },
}

export function LeadScoreBadge({ opportunity, showInsights = false, compact = false }: LeadScoreBadgeProps) {
  const result = useMemo(() => {
    const input: LeadScoreInput = {
      type: opportunity.type as LeadScoreInput["type"],
      status: opportunity.status,
      fullName: opportunity.full_name,
      email: opportunity.email,
      phone: opportunity.phone,
      whatsapp: opportunity.whatsapp,
      preferredContact: opportunity.preferred_contact,
      area: opportunity.area,
      propertyType: opportunity.property_type,
      bedrooms: opportunity.bedrooms,
      size: opportunity.size,
      price: opportunity.price,
      minPrice: opportunity.min_price,
      maxPrice: opportunity.max_price,
      features: opportunity.features || [],
      notes: opportunity.notes,
      marketComparisonPct: opportunity.market_comparison_pct,
      createdAt: opportunity.created_at,
      updatedAt: opportunity.updated_at,
    }
    return scoreLeadConversion(input)
  }, [opportunity])

  const config = tierConfig[result.tier]
  const Icon = config.icon

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", config.bg, config.text)} title={`Score: ${result.score}/100`}>
        <Icon className="h-2.5 w-2.5" />
        {result.score}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Score badge */}
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1", config.bg, config.text, config.ring)}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold">{config.label}</span>
        <div className="h-4 w-px bg-current opacity-20" />
        <span className="text-xs font-mono">{result.score}/100</span>
      </div>

      {/* Score breakdown bar */}
      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-muted">
        {(["completeness", "budgetFit", "engagement", "areaStrength", "recency"] as const).map((key) => (
          <div
            key={key}
            className={cn("h-full rounded-full transition-all", `bg-gradient-to-r ${config.gradient}`)}
            style={{ width: `${result.breakdown[key] / 5}%`, opacity: 0.4 + (result.breakdown[key] / 100) * 0.6 }}
            title={`${key}: ${result.breakdown[key]}`}
          />
        ))}
      </div>

      {/* Insights */}
      {showInsights && result.insights.length > 0 && (
        <div className="space-y-1">
          {result.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Small inline score for table rows */
export function LeadScoreInline({ opportunity }: Pick<LeadScoreBadgeProps, "opportunity">) {
  return <LeadScoreBadge opportunity={opportunity} compact />
}
