"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Sparkles, RefreshCw, Clock, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import type { Listing } from "../page"

interface MatchingTableProps {
  listings: Listing[]
  currentUserId: string
}

interface Match {
  stock: Listing
  request: Listing
  score: number
  reasons: string[]
}

// Area compatibility mapping
const areaCompatibility: Record<string, string[]> = {
  "Al Murooj": ["Tilal Al Ghaf", "Arabian Ranches", "Dubai Hills Estate"],
  "Tilal Al Ghaf": ["Al Murooj", "Arabian Ranches", "Dubai Hills Estate"],
  "Emirates Hills": ["Palm Jumeirah", "Jumeirah Golf Estates", "Al Barari"],
  "Palm Jumeirah": ["Emirates Hills", "Jumeirah Beach Residence", "Dubai Marina"],
  "Downtown Dubai": ["Business Bay", "DIFC", "City Walk"],
  "Dubai Marina": ["Jumeirah Beach Residence", "Palm Jumeirah"],
  "Arabian Ranches": ["Tilal Al Ghaf", "Al Murooj", "Dubai Hills Estate"],
  "Dubai Hills Estate": ["Arabian Ranches", "Tilal Al Ghaf", "Al Murooj"],
}

function calculateMatchScore(stock: Listing, request: Listing): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Type match (must match)
  if (stock.type === request.type) {
    score += 30
    reasons.push(`Property type matches: ${stock.type}`)
  } else {
    return { score: 0, reasons: [] }
  }

  // Price compatibility
  const priceDiff = Math.abs(stock.price - request.price) / request.price
  if (priceDiff <= 0.1) {
    score += 25
    reasons.push("Price within 10% of budget")
  } else if (priceDiff <= 0.2) {
    score += 15
    reasons.push("Price within 20% of budget")
  } else if (priceDiff <= 0.3) {
    score += 5
    reasons.push("Price slightly above budget (within 30%)")
  }

  // Size compatibility
  const sizeDiff = Math.abs(stock.size - request.size) / request.size
  if (sizeDiff <= 0.1) {
    score += 20
    reasons.push("Size within 10% of requirement")
  } else if (sizeDiff <= 0.2) {
    score += 10
    reasons.push("Size within 20% of requirement")
  }

  // Area match
  if (stock.area === request.area) {
    score += 25
    reasons.push(`Exact area match: ${stock.area}`)
  } else if (areaCompatibility[request.area]?.includes(stock.area)) {
    score += 15
    reasons.push(`Similar area: ${stock.area} (alternative to ${request.area})`)
  }

  // Bedroom match
  if (stock.bedrooms && request.bedrooms) {
    if (stock.bedrooms === request.bedrooms) {
      score += 10
      reasons.push(`Bedroom count matches: ${stock.bedrooms} BR`)
    } else if (Math.abs(stock.bedrooms - request.bedrooms) === 1) {
      score += 5
      reasons.push(`Bedroom count close: ${stock.bedrooms} BR vs ${request.bedrooms} BR requested`)
    }
  }

  return { score: Math.min(score, 100), reasons }
}

function findMatches(listings: Listing[]): Match[] {
  const stocks = listings.filter((l) => l.inquiryType === "stock")
  const requests = listings.filter((l) => l.inquiryType === "request")

  const matches: Match[] = []

  for (const request of requests) {
    for (const stock of stocks) {
      const { score, reasons } = calculateMatchScore(stock, request)
      if (score >= 40) {
        matches.push({ stock, request, score, reasons })
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(price)
}

// Check if current time is within Dubai business hours (09:00-20:00)
function isDubaiBusinessHours(): boolean {
  const now = new Date()
  // Dubai is UTC+4
  const dubaiOffset = 4 * 60 // in minutes
  const dubaiTime = new Date(now.getTime() + (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000)
  const hour = dubaiTime.getHours()
  return hour >= 9 && hour < 20
}

// Get time until next refresh (2 hours from now, or next business day start)
function getNextRefreshTime(): Date {
  const now = new Date()
  const dubaiOffset = 4 * 60
  const dubaiTime = new Date(now.getTime() + (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000)
  const hour = dubaiTime.getHours()

  if (hour >= 20) {
    // After business hours, next refresh at 9 AM next day
    const nextDay = new Date(dubaiTime)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(9, 0, 0, 0)
    return new Date(nextDay.getTime() - (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000)
  } else if (hour < 9) {
    // Before business hours, next refresh at 9 AM today
    const today = new Date(dubaiTime)
    today.setHours(9, 0, 0, 0)
    return new Date(today.getTime() - (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000)
  } else {
    // During business hours, next refresh in 2 hours
    const next = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    // But not after 20:00 Dubai time
    const nextDubaiHour = new Date(next.getTime() + (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000).getHours()
    if (nextDubaiHour >= 20) {
      // Next refresh will be tomorrow at 9 AM
      const nextDay = new Date(dubaiTime)
      nextDay.setDate(nextDay.getDate() + 1)
      nextDay.setHours(9, 0, 0, 0)
      return new Date(nextDay.getTime() - (dubaiOffset + now.getTimezoneOffset()) * 60 * 1000)
    }
    return next
  }
}

function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff <= 0) return "now"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function MatchingTable({ listings, currentUserId }: MatchingTableProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [nextRefresh, setNextRefresh] = useState<Date>(getNextRefreshTime())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>("")

  const runMatching = useCallback(async () => {
    setIsRefreshing(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 800))
    const foundMatches = findMatches(listings)
    setMatches(foundMatches)
    setLastRefresh(new Date())
    setNextRefresh(getNextRefreshTime())
    setIsRefreshing(false)
  }, [listings])

  // Initial matching on mount
  useEffect(() => {
    runMatching()
  }, []) // Only run once on mount

  // Re-run when listings change
  useEffect(() => {
    if (lastRefresh) {
      runMatching()
    }
  }, [listings.length]) // Re-run when listings count changes

  // Auto-refresh every 2 hours during Dubai business hours
  useEffect(() => {
    const checkAndRefresh = () => {
      if (isDubaiBusinessHours()) {
        const now = new Date()
        if (lastRefresh) {
          const timeSinceRefresh = now.getTime() - lastRefresh.getTime()
          if (timeSinceRefresh >= 2 * 60 * 60 * 1000) {
            runMatching()
          }
        }
      }
      setTimeUntilRefresh(formatTimeUntil(nextRefresh))
    }

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000)
    checkAndRefresh() // Initial check

    return () => clearInterval(interval)
  }, [lastRefresh, nextRefresh, runMatching])

  // Filter to show only top 5 matches
  const topMatches = useMemo(() => matches.slice(0, 5), [matches])

  if (matches.length === 0 && !isRefreshing) {
    return null // Don't show if no matches
  }

  return (
    <BackgroundGradient className="rounded-[22px] mb-6" containerClassName="mb-6">
      <Card className="border-0 bg-background dark:bg-zinc-900 rounded-[20px]">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Matching Table
              <Badge variant="secondary" className="ml-2">
                {matches.length} matches found
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isDubaiBusinessHours() ? (
                  <span>Next refresh: {timeUntilRefresh}</span>
                ) : (
                  <span>Paused (outside Dubai hours 09:00-20:00)</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => runMatching()}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          {lastRefresh && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString("en-AE", { timeZone: "Asia/Dubai" })} Dubai time
            </p>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {isRefreshing ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Analyzing matches...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {topMatches.map((match) => (
                  <div
                    key={`${match.stock.id}-${match.request.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
                  >
                    {/* Match Score */}
                    <Badge
                      variant={match.score >= 70 ? "default" : "secondary"}
                      className={`shrink-0 ${match.score >= 70 ? "bg-green-600" : ""}`}
                    >
                      {match.score}%
                    </Badge>

                    {/* Stock */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                          Stock
                        </Badge>
                        <span className="font-medium truncate">{match.stock.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {match.stock.area} • {formatPrice(match.stock.price)} • {match.stock.ownerName}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                    {/* Request */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                          Request
                        </Badge>
                        <span className="font-medium truncate">{match.request.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {match.request.area} • {formatPrice(match.request.price)} • {match.request.ownerName}
                      </p>
                    </div>
                  </div>
                ))}

                {matches.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Showing top 5 of {matches.length} matches. Use AI Matching button for full details.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
    </BackgroundGradient>
  )
}

// Export function to get user-specific matches
export function getUserMatches(listings: Listing[], userId: string): Match[] {
  const allMatches = findMatches(listings)
  // Filter matches where either the stock or request belongs to the user
  return allMatches.filter(
    (match) => match.stock.ownerId === userId || match.request.ownerId === userId
  )
}
