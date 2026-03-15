"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion"
import { Heart, X, Sparkles, ArrowRight, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RippleButton } from "@/components/ui/ripple-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Types matching the inventory page
type ListingStatus = "live" | "pocket" | "unofficial"
type ListingType = "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
type InquiryType = "stock" | "request"
type TransactionType = "sale" | "rent"

interface Listing {
  id: string
  title: string
  area: string
  size: number
  price: number
  type: ListingType
  status: ListingStatus
  inquiryType: InquiryType
  transactionType: TransactionType
  notes: string
  propertyFinderUrl?: string
  images: string[]
  bedrooms?: number
  bathrooms?: number
  availability?: string
  ownerId: string
  ownerName: string
  createdAt: string
  updatedAt: string
}

interface Match {
  stock: Listing
  request: Listing
  score: number
  reasons: string[]
}

type MatchStatus = "pending" | "liked" | "hidden"

interface MatchWithStatus extends Match {
  status: MatchStatus
}

// Demo data - in production this would come from API
const CURRENT_USER_ID = "user-1"

const demoListings: Listing[] = [
  {
    id: "1",
    title: "Luxury Villa with Pool",
    area: "Emirates Hills",
    size: 8500,
    price: 15000000,
    type: "villa",
    status: "live",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Corner plot, upgraded kitchen, private pool",
    images: [],
    bedrooms: 5,
    bathrooms: 6,
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Family Villa in Murooj",
    area: "Al Murooj",
    size: 5200,
    price: 8500000,
    type: "villa",
    status: "pocket",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Quiet community, near school, motivated seller",
    images: [],
    bedrooms: 4,
    bathrooms: 5,
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-15",
  },
  {
    id: "4",
    title: "Client Looking for Villa",
    area: "Tilal Al Ghaf",
    size: 6000,
    price: 10000000,
    type: "villa",
    status: "unofficial",
    inquiryType: "request",
    transactionType: "sale",
    notes: "Buyer prequalified, 10M budget, prefers new builds",
    images: [],
    bedrooms: 5,
    bathrooms: 5,
    ownerId: "user-1",
    ownerName: "Ahmed Hassan",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  {
    id: "6",
    title: "Townhouse Arabian Ranches",
    area: "Arabian Ranches",
    size: 3800,
    price: 5200000,
    type: "townhouse",
    status: "live",
    inquiryType: "stock",
    transactionType: "sale",
    notes: "Community pool access, landscaped garden",
    images: [],
    bedrooms: 4,
    bathrooms: 4,
    ownerId: "user-2",
    ownerName: "Sarah Miller",
    createdAt: "2024-01-14",
    updatedAt: "2024-01-14",
  },
]

// Area compatibility mapping
const areaCompatibility: Record<string, string[]> = {
  "Al Murooj": ["Tilal Al Ghaf", "Arabian Ranches", "Dubai Hills Estate"],
  "Tilal Al Ghaf": ["Al Murooj", "Arabian Ranches", "Dubai Hills Estate"],
  "Emirates Hills": ["Palm Jumeirah", "Jumeirah Golf Estates", "Al Barari"],
  "Arabian Ranches": ["Tilal Al Ghaf", "Al Murooj", "Dubai Hills Estate"],
}

function calculateMatchScore(stock: Listing, request: Listing): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  if (stock.type === request.type) {
    score += 30
    reasons.push(`Property type matches: ${stock.type}`)
  } else {
    return { score: 0, reasons: [] }
  }

  const priceDiff = Math.abs(stock.price - request.price) / request.price
  if (priceDiff <= 0.1) {
    score += 25
    reasons.push("Price within 10% of budget")
  } else if (priceDiff <= 0.2) {
    score += 15
    reasons.push("Price within 20% of budget")
  } else if (priceDiff <= 0.3) {
    score += 5
    reasons.push("Price slightly above budget")
  }

  const sizeDiff = Math.abs(stock.size - request.size) / request.size
  if (sizeDiff <= 0.1) {
    score += 20
    reasons.push("Size within 10% of requirement")
  } else if (sizeDiff <= 0.2) {
    score += 10
    reasons.push("Size within 20% of requirement")
  }

  if (stock.area === request.area) {
    score += 25
    reasons.push(`Exact area match: ${stock.area}`)
  } else if (areaCompatibility[request.area]?.includes(stock.area)) {
    score += 15
    reasons.push(`Similar area: ${stock.area}`)
  }

  if (stock.bedrooms && request.bedrooms) {
    if (stock.bedrooms === request.bedrooms) {
      score += 10
      reasons.push(`Bedroom count matches: ${stock.bedrooms} BR`)
    }
  }

  return { score: Math.min(score, 100), reasons }
}

function getUserMatches(listings: Listing[], userId: string): Match[] {
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

  return matches
    .filter((match) => match.stock.ownerId === userId || match.request.ownerId === userId)
    .sort((a, b) => b.score - a.score)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(price)
}

function MiniSwipeCard({
  match,
  onSwipe,
}: {
  match: MatchWithStatus
  onSwipe: (direction: "left" | "right") => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 150], [-15, 15])
  const likeOpacity = useTransform(x, [0, 75], [0, 1])
  const hideOpacity = useTransform(x, [-75, 0], [1, 0])

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x > 75) {
      onSwipe("right")
    } else if (info.offset.x < -75) {
      onSwipe("left")
    }
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <Card className="h-full overflow-hidden border-2 shadow-lg">
        {/* Like/Hide overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none flex items-center justify-center"
        >
          <Heart className="h-8 w-8 text-green-500" />
        </motion.div>
        <motion.div
          style={{ opacity: hideOpacity }}
          className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none flex items-center justify-center"
        >
          <X className="h-8 w-8 text-red-500" />
        </motion.div>

        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant={match.score >= 70 ? "default" : "secondary"}
              className={match.score >= 70 ? "bg-green-600" : ""}
            >
              {match.score}%
            </Badge>
            {match.score >= 70 && <Sparkles className="h-4 w-4 text-yellow-500" />}
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs mb-1">
                Stock
              </Badge>
              <p className="font-semibold text-sm truncate">{match.stock.title}</p>
              <p className="text-xs text-muted-foreground">{match.stock.area} • {formatPrice(match.stock.price)}</p>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs mb-1">
                Request
              </Badge>
              <p className="font-semibold text-sm truncate">{match.request.title}</p>
              <p className="text-xs text-muted-foreground">{match.request.area} • {formatPrice(match.request.price)}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function MyMatchesWidget() {
  const [matchStatuses, setMatchStatuses] = useState<Record<string, MatchStatus>>({})

  const matches = useMemo(() => getUserMatches(demoListings, CURRENT_USER_ID), [])

  const matchesWithStatus: MatchWithStatus[] = matches.map((match) => ({
    ...match,
    status: matchStatuses[`${match.stock.id}-${match.request.id}`] || "pending",
  }))

  const pendingMatches = matchesWithStatus.filter((m) => m.status === "pending")
  const likedCount = matchesWithStatus.filter((m) => m.status === "liked").length

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (pendingMatches.length === 0) return

    const currentMatch = pendingMatches[0]
    const matchId = `${currentMatch.stock.id}-${currentMatch.request.id}`

    setMatchStatuses((prev) => ({
      ...prev,
      [matchId]: direction === "right" ? "liked" : "hidden",
    }))
  }, [pendingMatches])

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            My Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No matches yet. Add listings to start matching!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            My Matches
            <Badge variant="secondary">{pendingMatches.length} new</Badge>
          </CardTitle>
          <Link href="/user/marketplace">
            <RippleButton variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </RippleButton>
          </Link>
        </div>
        {likedCount > 0 && (
          <p className="text-xs text-muted-foreground">
            <Heart className="h-3 w-3 inline text-green-500 mr-1" />
            {likedCount} liked
          </p>
        )}
      </CardHeader>
      <CardContent>
        {pendingMatches.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">All caught up!</p>
            <Link href="/user/marketplace">
              <RippleButton variant="outline" size="sm">
                View liked matches
              </RippleButton>
            </Link>
          </div>
        ) : (
          <>
            {/* Mini swipe card */}
            <div className="relative h-[220px] mb-3">
              <AnimatePresence>
                {pendingMatches.slice(0, 1).map((match) => (
                  <MiniSwipeCard
                    key={`${match.stock.id}-${match.request.id}`}
                    match={match}
                    onSwipe={handleSwipe}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3">
              <RippleButton
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleSwipe("left")}
                rippleColor="rgba(239, 68, 68, 0.3)"
              >
                <X className="h-5 w-5 text-red-500" />
              </RippleButton>

              <span className="text-xs text-muted-foreground">
                {pendingMatches.length} left
              </span>

              <RippleButton
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-2 border-green-200 hover:bg-green-50 hover:border-green-300"
                onClick={() => handleSwipe("right")}
                rippleColor="rgba(34, 197, 94, 0.3)"
              >
                <Heart className="h-5 w-5 text-green-500" />
              </RippleButton>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
