"use client"

import { useState, useCallback } from "react"
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion"
import { Heart, X, Sparkles, MessageCircle, Phone, ArrowRight, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RippleButton } from "@/components/ui/ripple-button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Listing } from "../page"

interface Match {
  stock: Listing
  request: Listing
  score: number
  reasons: string[]
}

interface MyMatchesViewProps {
  matches: Match[]
}

type MatchStatus = "pending" | "liked" | "hidden"

interface MatchWithStatus extends Match {
  status: MatchStatus
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(price)
}

function SwipeCard({
  match,
  onSwipe,
  isTop
}: {
  match: MatchWithStatus
  onSwipe: (direction: "left" | "right") => void
  isTop: boolean
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Overlay indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const hideOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right")
    } else if (info.offset.x < -100) {
      onSwipe("left")
    }
  }

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: isTop ? 10 : 1
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <Card className="h-full overflow-hidden bg-card border-2 shadow-xl">
        {/* Like/Hide overlay indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none flex items-center justify-center"
        >
          <div className="bg-green-500 text-white px-8 py-4 rounded-xl rotate-[-15deg] border-4 border-green-600">
            <Heart className="h-12 w-12" />
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: hideOpacity }}
          className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none flex items-center justify-center"
        >
          <div className="bg-red-500 text-white px-8 py-4 rounded-xl rotate-[15deg] border-4 border-red-600">
            <X className="h-12 w-12" />
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="h-full overflow-y-auto p-4 pb-24">
          {/* Match Score Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={match.score >= 70 ? "default" : "secondary"}
                className={`text-lg px-4 py-1 ${match.score >= 70 ? "bg-green-600" : ""}`}
              >
                {match.score}% Match
              </Badge>
              {match.score >= 70 && (
                <Sparkles className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Stock Listing */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Stock Listing
              </Badge>
              <Badge variant="outline" className="text-xs">
                {match.stock.status}
              </Badge>
            </div>
            <p className="font-bold text-xl">{match.stock.title}</p>
            <p className="text-muted-foreground">{match.stock.area}</p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Price</span>
                <p className="font-semibold">{formatPrice(match.stock.price)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Size</span>
                <p className="font-semibold">{match.stock.size.toLocaleString()} sqft</p>
              </div>
              {match.stock.bedrooms && (
                <div>
                  <span className="text-muted-foreground text-xs">Bedrooms</span>
                  <p className="font-semibold">{match.stock.bedrooms} BR</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-xs">Type</span>
                <p className="font-semibold capitalize">{match.stock.type}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-medium">{match.stock.ownerName}</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
          </div>

          {/* Buyer Request */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                Buyer Request
              </Badge>
            </div>
            <p className="font-bold text-xl">{match.request.title}</p>
            <p className="text-muted-foreground">{match.request.area}</p>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Budget</span>
                <p className="font-semibold">{formatPrice(match.request.price)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Size needed</span>
                <p className="font-semibold">{match.request.size.toLocaleString()} sqft</p>
              </div>
              {match.request.bedrooms && (
                <div>
                  <span className="text-muted-foreground text-xs">Bedrooms</span>
                  <p className="font-semibold">{match.request.bedrooms} BR</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-xs">Type</span>
                <p className="font-semibold capitalize">{match.request.type}</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-medium">{match.request.ownerName}</span>
            </div>
            {match.request.notes && (
              <div className="mt-3 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg text-sm">
                <span className="text-muted-foreground text-xs">Notes:</span>
                <p className="mt-1">{match.request.notes}</p>
              </div>
            )}
          </div>

          {/* Match Reasons */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Why this is a good match:
            </p>
            <ul className="space-y-2">
              {match.reasons.map((reason, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function MatchList({
  matches,
  onRestore,
  type
}: {
  matches: MatchWithStatus[]
  onRestore: (matchId: string) => void
  type: "liked" | "hidden"
}) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className={`p-4 rounded-full mb-4 ${type === "liked" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          {type === "liked" ? (
            <Heart className="h-8 w-8 text-green-600" />
          ) : (
            <X className="h-8 w-8 text-red-600" />
          )}
        </div>
        <p className="text-muted-foreground">
          No {type} matches yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
      {matches.map((match) => {
        const matchId = `${match.stock.id}-${match.request.id}`
        return (
          <Card key={matchId} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={match.score >= 70 ? "default" : "secondary"}
                      className={match.score >= 70 ? "bg-green-600" : ""}
                    >
                      {match.score}%
                    </Badge>
                    <span className="font-semibold truncate">{match.stock.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {match.stock.area} • {formatPrice(match.stock.price)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyer: {match.request.ownerName}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <RippleButton
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(matchId)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </RippleButton>
                  {type === "liked" && (
                    <>
                      <RippleButton variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </RippleButton>
                      <RippleButton variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </RippleButton>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function MyMatchesView({ matches }: MyMatchesViewProps) {
  const [matchStatuses, setMatchStatuses] = useState<Record<string, MatchStatus>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const matchesWithStatus: MatchWithStatus[] = matches.map((match) => ({
    ...match,
    status: matchStatuses[`${match.stock.id}-${match.request.id}`] || "pending",
  }))

  const pendingMatches = matchesWithStatus.filter((m) => m.status === "pending")
  const likedMatches = matchesWithStatus.filter((m) => m.status === "liked")
  const hiddenMatches = matchesWithStatus.filter((m) => m.status === "hidden")

  const handleSwipe = useCallback((direction: "left" | "right") => {
    if (pendingMatches.length === 0) return

    const currentMatch = pendingMatches[0]
    const matchId = `${currentMatch.stock.id}-${currentMatch.request.id}`

    setMatchStatuses((prev) => ({
      ...prev,
      [matchId]: direction === "right" ? "liked" : "hidden",
    }))
  }, [pendingMatches])

  const handleRestore = useCallback((matchId: string) => {
    setMatchStatuses((prev) => ({
      ...prev,
      [matchId]: "pending",
    }))
  }, [])

  const handleButtonSwipe = (direction: "left" | "right") => {
    handleSwipe(direction)
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
        <p className="text-muted-foreground max-w-md">
          When your listings or inquiries match with other agents&apos; inventory, they&apos;ll appear here.
          Add more listings or buyer requests to increase your chances of finding matches.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="swipe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="swipe" className="relative">
            New
            {pendingMatches.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="liked" className="relative">
            <Heart className="h-4 w-4 mr-1" />
            Liked
            {likedMatches.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-100 text-green-700">
                {likedMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="hidden">
            <X className="h-4 w-4 mr-1" />
            Hidden
            {hiddenMatches.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {hiddenMatches.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swipe" className="mt-0">
          {pendingMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground max-w-md">
                You&apos;ve reviewed all your matches. Check your liked matches to contact agents,
                or wait for new matches to appear.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Card Stack */}
              <div className="relative h-[65vh] md:h-[60vh] overflow-hidden">
                <AnimatePresence>
                  {pendingMatches.slice(0, 2).map((match, index) => (
                    <SwipeCard
                      key={`${match.stock.id}-${match.request.id}`}
                      match={match}
                      onSwipe={handleSwipe}
                      isTop={index === 0}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Action Buttons - Fixed at bottom for easy thumb access */}
              <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto p-4 bg-background/95 backdrop-blur-sm border-t md:border-0 md:bg-transparent md:backdrop-blur-none z-50">
                <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
                  <RippleButton
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-950"
                    onClick={() => handleButtonSwipe("left")}
                    rippleColor="rgba(239, 68, 68, 0.3)"
                  >
                    <X className="h-8 w-8 text-red-500" />
                  </RippleButton>

                  <div className="text-center text-xs text-muted-foreground">
                    <p>{pendingMatches.length} left</p>
                  </div>

                  <RippleButton
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 rounded-full border-2 border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950"
                    onClick={() => handleButtonSwipe("right")}
                    rippleColor="rgba(34, 197, 94, 0.3)"
                  >
                    <Heart className="h-8 w-8 text-green-500" />
                  </RippleButton>
                </div>

                {/* Swipe hint for mobile */}
                <p className="text-center text-xs text-muted-foreground mt-3 md:hidden">
                  Swipe right to like, left to hide
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          <MatchList
            matches={likedMatches}
            onRestore={handleRestore}
            type="liked"
          />
        </TabsContent>

        <TabsContent value="hidden" className="mt-0">
          <MatchList
            matches={hiddenMatches}
            onRestore={handleRestore}
            type="hidden"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
