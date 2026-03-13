"use client"

import { useMemo } from "react"
import {
  Smile,
  Meh,
  Frown,
  Zap,
  ShoppingCart,
  AlertTriangle,
  TrendingDown,
  Eye,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  analyseConversation,
  type ChatMessage,
  type SentimentResult,
  type SentimentLabel,
  type IntentSignal,
} from "@/lib/sentiment-analysis"

const sentimentConfig: Record<SentimentLabel, { icon: typeof Smile; color: string; bg: string; label: string }> = {
  positive: {
    icon: Smile,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    label: "Positive",
  },
  neutral: {
    icon: Meh,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-500/20",
    label: "Neutral",
  },
  negative: {
    icon: Frown,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-500/20",
    label: "Negative",
  },
}

const intentConfig: Record<IntentSignal, { icon: typeof ShoppingCart; label: string; color: string }> = {
  strong_buy: { icon: ShoppingCart, label: "Strong Buy Intent", color: "text-emerald-600" },
  exploring: { icon: Eye, label: "Exploring", color: "text-blue-600" },
  objecting: { icon: AlertTriangle, label: "Objecting", color: "text-amber-600" },
  disengaging: { icon: TrendingDown, label: "Disengaging", color: "text-red-600" },
  neutral: { icon: MessageSquare, label: "Neutral", color: "text-slate-500" },
}

interface SentimentIndicatorProps {
  messages: { role: "user" | "bot"; content: string; timestamp: Date | string }[]
  compact?: boolean
}

export function SentimentIndicator({ messages, compact = false }: SentimentIndicatorProps) {
  const result = useMemo(() => {
    if (!messages || messages.length < 2) return null
    const chatMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      message: m.content,
      timestamp: m.timestamp,
    }))
    return analyseConversation(chatMessages)
  }, [messages])

  if (!result) return null

  const sConfig = sentimentConfig[result.sentiment]
  const iConfig = intentConfig[result.intent]
  const SentimentIcon = sConfig.icon
  const IntentIcon = iConfig.icon

  if (compact) {
    return (
      <div
        className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium", sConfig.bg, sConfig.color)}
        title={`${sConfig.label} | ${iConfig.label} | Risk: ${result.riskLevel}%`}
      >
        <SentimentIcon className="h-2.5 w-2.5" />
        {result.sentimentScore > 0 ? "+" : ""}{result.sentimentScore.toFixed(1)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Main sentiment + intent row */}
      <div className="flex items-center gap-2">
        <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg", sConfig.bg, sConfig.color)}>
          <SentimentIcon className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{sConfig.label}</span>
        </div>
        <div className={cn("inline-flex items-center gap-1 text-xs", iConfig.color)}>
          <IntentIcon className="h-3 w-3" />
          <span className="font-medium">{iConfig.label}</span>
        </div>
        {result.urgency === "high" && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-[10px] font-semibold">
            <Zap className="h-2.5 w-2.5" />
            Urgent
          </div>
        )}
      </div>

      {/* Risk bar */}
      {result.riskLevel > 20 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-8">Risk</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                result.riskLevel > 60 ? "bg-red-500" : result.riskLevel > 35 ? "bg-amber-500" : "bg-blue-500"
              )}
              style={{ width: `${result.riskLevel}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-6 text-right">{result.riskLevel}%</span>
        </div>
      )}

      {/* Highlights */}
      {result.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.highlights.slice(0, 3).map((h, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
