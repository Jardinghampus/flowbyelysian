"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  GraduationCap,
  ShoppingBag,
  Stethoscope,
  Bus,
  TreePine,
  Shield,
  TrendingUp,
  Star,
} from "lucide-react"

interface ScoreItem {
  label: string
  score: number
  icon: React.ElementType
  color: string
}

// Scores per area (mock data)
const areaScores: Record<string, ScoreItem[]> = {
  "palm-jumeirah": [
    { label: "Schools", score: 7.5, icon: GraduationCap, color: "#3b82f6" },
    { label: "Shopping", score: 8.5, icon: ShoppingBag, color: "#8b5cf6" },
    { label: "Healthcare", score: 8.0, icon: Stethoscope, color: "#ef4444" },
    { label: "Transport", score: 6.5, icon: Bus, color: "#f59e0b" },
    { label: "Parks", score: 7.0, icon: TreePine, color: "#10b981" },
    { label: "Safety", score: 9.5, icon: Shield, color: "#06b6d4" },
    { label: "Investment", score: 9.0, icon: TrendingUp, color: "#f97316" },
  ],
  jge: [
    { label: "Schools", score: 8.5, icon: GraduationCap, color: "#3b82f6" },
    { label: "Shopping", score: 7.0, icon: ShoppingBag, color: "#8b5cf6" },
    { label: "Healthcare", score: 7.5, icon: Stethoscope, color: "#ef4444" },
    { label: "Transport", score: 7.0, icon: Bus, color: "#f59e0b" },
    { label: "Parks", score: 9.0, icon: TreePine, color: "#10b981" },
    { label: "Safety", score: 9.0, icon: Shield, color: "#06b6d4" },
    { label: "Investment", score: 8.5, icon: TrendingUp, color: "#f97316" },
  ],
  "al-furjan": [
    { label: "Schools", score: 8.0, icon: GraduationCap, color: "#3b82f6" },
    { label: "Shopping", score: 7.5, icon: ShoppingBag, color: "#8b5cf6" },
    { label: "Healthcare", score: 7.0, icon: Stethoscope, color: "#ef4444" },
    { label: "Transport", score: 9.0, icon: Bus, color: "#f59e0b" },
    { label: "Parks", score: 7.5, icon: TreePine, color: "#10b981" },
    { label: "Safety", score: 8.5, icon: Shield, color: "#06b6d4" },
    { label: "Investment", score: 8.0, icon: TrendingUp, color: "#f97316" },
  ],
  "tilal-al-ghaf": [
    { label: "Schools", score: 7.0, icon: GraduationCap, color: "#3b82f6" },
    { label: "Shopping", score: 6.5, icon: ShoppingBag, color: "#8b5cf6" },
    { label: "Healthcare", score: 6.5, icon: Stethoscope, color: "#ef4444" },
    { label: "Transport", score: 6.0, icon: Bus, color: "#f59e0b" },
    { label: "Parks", score: 9.5, icon: TreePine, color: "#10b981" },
    { label: "Safety", score: 9.5, icon: Shield, color: "#06b6d4" },
    { label: "Investment", score: 9.5, icon: TrendingUp, color: "#f97316" },
  ],
  "damac-hills": [
    { label: "Schools", score: 8.0, icon: GraduationCap, color: "#3b82f6" },
    { label: "Shopping", score: 7.5, icon: ShoppingBag, color: "#8b5cf6" },
    { label: "Healthcare", score: 7.0, icon: Stethoscope, color: "#ef4444" },
    { label: "Transport", score: 7.0, icon: Bus, color: "#f59e0b" },
    { label: "Parks", score: 8.5, icon: TreePine, color: "#10b981" },
    { label: "Safety", score: 9.0, icon: Shield, color: "#06b6d4" },
    { label: "Investment", score: 8.0, icon: TrendingUp, color: "#f97316" },
  ],
}

function ScoreBar({ item, index }: { item: ScoreItem; index: number }) {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <div
        className="h-6 w-6 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: `${item.color}15` }}
      >
        <Icon className="h-3 w-3" style={{ color: item.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-medium text-gray-600 dark:text-neutral-400">{item.label}</span>
          <span className="text-[10px] font-bold text-gray-900 dark:text-white">{item.score}/10</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${item.score * 10}%` }}
            transition={{ delay: index * 0.05 + 0.2, duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: item.color }}
          />
        </div>
      </div>
    </motion.div>
  )
}

interface NeighborhoodScoreProps {
  areaSlug: string
}

export function NeighborhoodScore({ areaSlug }: NeighborhoodScoreProps) {
  const scores = areaScores[areaSlug]
  if (!scores) return null

  const overallScore = (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Neighborhood Score</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-primary">{overallScore}</span>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500">/10</span>
        </div>
      </div>
      <div className="space-y-2">
        {scores.map((item, index) => (
          <ScoreBar key={item.label} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
