"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface PriceDataPoint {
  year: string
  avgPrice: number
  change: number
}

const areaPriceHistory: Record<string, PriceDataPoint[]> = {
  "palm-jumeirah": [
    { year: "2021", avgPrice: 2100, change: 5.0 },
    { year: "2022", avgPrice: 2520, change: 20.0 },
    { year: "2023", avgPrice: 2900, change: 15.1 },
    { year: "2024", avgPrice: 3100, change: 6.9 },
    { year: "2025", avgPrice: 3200, change: 3.2 },
  ],
  jge: [
    { year: "2021", avgPrice: 950, change: 8.0 },
    { year: "2022", avgPrice: 1100, change: 15.8 },
    { year: "2023", avgPrice: 1280, change: 16.4 },
    { year: "2024", avgPrice: 1400, change: 9.4 },
    { year: "2025", avgPrice: 1450, change: 3.6 },
  ],
  "al-furjan": [
    { year: "2021", avgPrice: 750, change: 6.0 },
    { year: "2022", avgPrice: 870, change: 16.0 },
    { year: "2023", avgPrice: 980, change: 12.6 },
    { year: "2024", avgPrice: 1060, change: 8.2 },
    { year: "2025", avgPrice: 1100, change: 3.8 },
  ],
  "tilal-al-ghaf": [
    { year: "2021", avgPrice: 1200, change: 0 },
    { year: "2022", avgPrice: 1400, change: 16.7 },
    { year: "2023", avgPrice: 1650, change: 17.9 },
    { year: "2024", avgPrice: 1780, change: 7.9 },
    { year: "2025", avgPrice: 1800, change: 1.1 },
  ],
  "damac-hills": [
    { year: "2021", avgPrice: 800, change: 5.0 },
    { year: "2022", avgPrice: 950, change: 18.8 },
    { year: "2023", avgPrice: 1100, change: 15.8 },
    { year: "2024", avgPrice: 1200, change: 9.1 },
    { year: "2025", avgPrice: 1250, change: 4.2 },
  ],
}

interface PriceHistoryProps {
  areaSlug: string
}

export function PriceHistory({ areaSlug }: PriceHistoryProps) {
  const history = areaPriceHistory[areaSlug]
  if (!history) return null

  const maxPrice = Math.max(...history.map((d) => d.avgPrice))
  const minPrice = Math.min(...history.map((d) => d.avgPrice))
  const range = maxPrice - minPrice

  // 5-year change
  const totalChange = ((history[history.length - 1].avgPrice - history[0].avgPrice) / history[0].avgPrice * 100).toFixed(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Price History</h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">+{totalChange}%</span>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500">5yr</span>
        </div>
      </div>

      {/* Chart bars */}
      <div className="flex items-end gap-1.5 h-24 mb-2">
        {history.map((point, i) => {
          const height = range > 0 ? ((point.avgPrice - minPrice) / range) * 80 + 20 : 50
          return (
            <motion.div
              key={point.year}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-t-md relative group cursor-pointer"
              style={{
                background: `linear-gradient(to top, ${point.change >= 10 ? "#10b981" : point.change >= 5 ? "#3b82f6" : "#f59e0b"}, ${point.change >= 10 ? "#10b98133" : point.change >= 5 ? "#3b82f633" : "#f59e0b33"})`,
              }}
            >
              {/* Tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                  <div className="font-semibold">AED {point.avgPrice}/sqft</div>
                  <div className={cn(
                    point.change >= 0 ? "text-emerald-300 dark:text-emerald-600" : "text-red-300 dark:text-red-600"
                  )}>
                    {point.change >= 0 ? "+" : ""}{point.change}%
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Year labels */}
      <div className="flex gap-1.5">
        {history.map((point) => (
          <div key={point.year} className="flex-1 text-center text-[10px] text-gray-400 dark:text-neutral-500">
            {point.year}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400 dark:text-neutral-500">
        <span className="text-gray-600 dark:text-neutral-300 font-medium">Avg price/sqft (AED)</span>
      </div>
    </motion.div>
  )
}
