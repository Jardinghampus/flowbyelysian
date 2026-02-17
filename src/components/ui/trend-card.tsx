"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TrendType = "up" | "down" | "neutral"
type ChangeType = "positive" | "negative" | "neutral"

interface TrendCardProps {
  title: string
  value: string
  change: string
  changeType: ChangeType
  trendType: TrendType
  chipPosition?: "top" | "bottom"
  className?: string
  delay?: number
}

const trendColors = {
  positive: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  negative: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  neutral: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

const TrendIcon = ({ type }: { type: TrendType }) => {
  if (type === "up") return <TrendingUp className="h-3 w-3" />
  if (type === "down") return <TrendingDown className="h-3 w-3" />
  return <Minus className="h-3 w-3" />
}

export function TrendCard({
  title,
  value,
  change,
  changeType,
  trendType,
  chipPosition = "top",
  className,
  delay = 0,
}: TrendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className={cn("relative py-0", className)}>
        <div className="flex p-3.5">
          <div className="flex flex-col gap-y-1">
            <dt className="text-xs text-muted-foreground font-medium">{title}</dt>
            <dd className="text-xl font-semibold tracking-tight">{value}</dd>
          </div>
          <div
            className={cn(
              "absolute right-3.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              trendColors[changeType],
              chipPosition === "top" ? "top-3.5" : "bottom-3.5"
            )}
          >
            <TrendIcon type={trendType} />
            {change}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface TrendCardGridProps {
  data: TrendCardProps[]
  columns?: 2 | 3 | 4
}

export function TrendCardGrid({ data, columns = 4 }: TrendCardGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }

  return (
    <dl className={cn("grid gap-3", gridCols[columns])}>
      {data.map((props, index) => (
        <TrendCard key={props.title} {...props} delay={index} />
      ))}
    </dl>
  )
}
