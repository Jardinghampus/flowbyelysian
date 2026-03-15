"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MapPin,
  Building2,
  Plus,
  X,
  Clock,
  Filter,
  Sparkles,
  DollarSign,
  Home,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  type: "new_listing" | "price_drop" | "delisted" | "trend"
  area: string
  title: string
  detail: string
  change?: number
  timestamp: string
  property?: {
    type: string
    beds: number
    price: number
    pricePerSqft: number
  }
}

const sampleAlerts: Alert[] = [
  {
    id: "1",
    type: "price_drop",
    area: "Dubai Marina",
    title: "Price reduced on 3BR in Marina Gate",
    detail: "AED 3.2M → AED 2.85M (10.9% reduction). Listed 42 days ago — owner may be motivated.",
    change: -10.9,
    timestamp: "2 hours ago",
    property: { type: "Apartment", beds: 3, price: 2850000, pricePerSqft: 1420 },
  },
  {
    id: "2",
    type: "new_listing",
    area: "JBR",
    title: "3 new listings below market in JBR",
    detail: "Average asking price AED 1,850/sqft vs market average AED 2,100/sqft. Potential opportunity.",
    timestamp: "4 hours ago",
    property: { type: "Apartment", beds: 2, price: 2200000, pricePerSqft: 1850 },
  },
  {
    id: "3",
    type: "delisted",
    area: "Palm Jumeirah",
    title: "Villa delisted after 3 days on market",
    detail: "5BR villa at AED 28M removed quickly — may indicate off-market deal or valuation issue.",
    timestamp: "5 hours ago",
    property: { type: "Villa", beds: 5, price: 28000000, pricePerSqft: 3200 },
  },
  {
    id: "4",
    type: "trend",
    area: "Business Bay",
    title: "Rental yields climbing in Business Bay",
    detail: "Average yield up from 6.2% to 7.1% over the past quarter. Studio and 1BR driving the increase.",
    change: 14.5,
    timestamp: "Today",
  },
  {
    id: "5",
    type: "price_drop",
    area: "Downtown Dubai",
    title: "2 consecutive price drops on Boulevard Point unit",
    detail: "AED 4.5M → AED 4.1M → AED 3.8M over 60 days. Strong buyer leverage opportunity.",
    change: -15.6,
    timestamp: "6 hours ago",
    property: { type: "Apartment", beds: 2, price: 3800000, pricePerSqft: 2300 },
  },
  {
    id: "6",
    type: "new_listing",
    area: "Dubai Hills",
    title: "Rare 6BR villa listed in Dubai Hills Estate",
    detail: "First listing of this type in 3 months. AED 15M — below recent transaction of AED 16.8M for similar unit.",
    timestamp: "8 hours ago",
    property: { type: "Villa", beds: 6, price: 15000000, pricePerSqft: 1800 },
  },
]

const watchedAreas = [
  { name: "Dubai Marina", active: true, alertCount: 8 },
  { name: "Downtown Dubai", active: true, alertCount: 5 },
  { name: "JBR", active: true, alertCount: 3 },
  { name: "Palm Jumeirah", active: true, alertCount: 2 },
  { name: "Business Bay", active: false, alertCount: 0 },
]

export default function MarketPulsePage() {
  const [areas, setAreas] = useState(watchedAreas)
  const [newArea, setNewArea] = useState("")
  const [filter, setFilter] = useState<"all" | "new_listing" | "price_drop" | "delisted" | "trend">("all")
  const [alerts] = useState(sampleAlerts)

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.type === filter)

  const addArea = () => {
    if (!newArea.trim()) return
    setAreas((prev) => [
      ...prev,
      { name: newArea.trim(), active: true, alertCount: 0 },
    ])
    setNewArea("")
  }

  const removeArea = (name: string) => {
    setAreas((prev) => prev.filter((a) => a.name !== name))
  }

  const toggleArea = (name: string) => {
    setAreas((prev) =>
      prev.map((a) => (a.name === name ? { ...a, active: !a.active } : a))
    )
  }

  const typeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "new_listing": return <Home className="h-4 w-4 text-blue-500" />
      case "price_drop": return <TrendingDown className="h-4 w-4 text-green-500" />
      case "delisted": return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "trend": return <TrendingUp className="h-4 w-4 text-purple-500" />
    }
  }

  const typeBadge = (type: Alert["type"]) => {
    const styles: Record<string, string> = {
      new_listing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      price_drop: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      delisted: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      trend: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    }
    const labels: Record<string, string> = {
      new_listing: "New Listing",
      price_drop: "Price Drop",
      delisted: "Delisted",
      trend: "Market Trend",
    }
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", styles[type])}>
        {labels[type]}
      </span>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Market Pulse
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-monitored alerts for your areas. Price drops, new listings, delistings, and trends.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Updated every 30 min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Watched areas */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Watched Areas
            </h3>

            <div className="space-y-2">
              {areas.map((a) => (
                <div
                  key={a.name}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={a.active}
                      onCheckedChange={() => toggleArea(a.name)}
                      className="scale-75"
                    />
                    <span className={cn("text-xs", !a.active && "text-muted-foreground")}>
                      {a.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {a.alertCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                        {a.alertCount}
                      </Badge>
                    )}
                    <button
                      onClick={() => removeArea(a.name)}
                      className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Add area..."
                className="text-xs h-8"
                onKeyDown={(e) => e.key === "Enter" && addArea()}
              />
              <Button size="sm" variant="outline" onClick={addArea} className="h-8 px-2">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Today&apos;s Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New listings</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price drops</span>
                <span className="font-medium text-green-600 dark:text-green-400">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delistings</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trend alerts</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main: Alerts feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              { value: "all" as const, label: "All" },
              { value: "new_listing" as const, label: "New Listings" },
              { value: "price_drop" as const, label: "Price Drops" },
              { value: "delisted" as const, label: "Delisted" },
              { value: "trend" as const, label: "Trends" },
            ]).map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  filter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert cards */}
          <div className="space-y-3">
            {filteredAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{typeIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {typeBadge(alert.type)}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.area}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{alert.detail}</p>

                    {alert.property && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {alert.property.type}
                        </span>
                        <span>{alert.property.beds} BR</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          AED {(alert.property.price / 1000000).toFixed(1)}M
                        </span>
                        <span>AED {alert.property.pricePerSqft.toLocaleString()}/sqft</span>
                        {alert.change && (
                          <span className={cn(
                            "font-medium",
                            alert.change < 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {alert.change > 0 ? "+" : ""}{alert.change}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
