"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Listing } from "../page"

interface AIMatchingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listings: Listing[]
}

interface Match {
  stock: Listing
  request: Listing
  score: number
  reasons: string[]
}

// Area compatibility mapping - which areas are similar/alternative
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
    return { score: 0, reasons: [] } // No match if type doesn't match
  }

  // Price compatibility (within 20%)
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

  // Size compatibility (within 20%)
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

export function AIMatchingDialog({
  open,
  onOpenChange,
  listings,
}: AIMatchingDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [feedback, setFeedback] = useState<Record<string, "good" | "bad">>({})

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const foundMatches = findMatches(listings)
    setMatches(foundMatches)
    setIsAnalyzing(false)
  }

  const handleFeedback = (matchId: string, type: "good" | "bad") => {
    setFeedback((prev) => ({ ...prev, [matchId]: type }))
    // In production, this would send feedback to train the model
  }

  const getMatchId = (match: Match) => `${match.stock.id}-${match.request.id}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Property Matching
          </DialogTitle>
          <DialogDescription>
            Our AI analyzes your inventory and buyer requests to find potential matches based on
            price, size, area, and property type. Train the model by providing feedback on matches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {matches.length === 0 && !isAnalyzing && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Click analyze to find matching properties between your stock and buyer requests.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                The AI considers area compatibility (e.g., Villa in Murooj may match buyers looking
                for Tilal Al Ghaf if price/size criteria are met).
              </p>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Matches
                  </>
                )}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Analyzing your inventory...</p>
              <p className="text-xs text-muted-foreground mt-2">
                Matching properties based on type, price, size, and area compatibility
              </p>
            </div>
          )}

          {matches.length > 0 && !isAnalyzing && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {matches.length} potential match{matches.length !== 1 ? "es" : ""}
                </p>
                <Button variant="outline" size="sm" onClick={handleAnalyze}>
                  Re-analyze
                </Button>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {matches.map((match) => {
                    const matchId = getMatchId(match)
                    const userFeedback = feedback[matchId]

                    return (
                      <Card key={matchId} className={userFeedback === "bad" ? "opacity-50" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Badge
                                variant={match.score >= 70 ? "default" : "secondary"}
                                className={match.score >= 70 ? "bg-green-600" : ""}
                              >
                                {match.score}% Match
                              </Badge>
                              {match.score >= 70 && (
                                <span className="text-xs text-green-600">Strong match</span>
                              )}
                            </CardTitle>
                            <div className="flex gap-1">
                              <Button
                                variant={userFeedback === "good" ? "default" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleFeedback(matchId, "good")}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={userFeedback === "bad" ? "destructive" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleFeedback(matchId, "bad")}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                            {/* Stock */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <Badge variant="outline" className="mb-2 bg-blue-500/10 text-blue-600 border-blue-500/20">
                                Stock
                              </Badge>
                              <p className="font-medium line-clamp-1">{match.stock.title}</p>
                              <p className="text-sm text-muted-foreground">{match.stock.area}</p>
                              <p className="text-sm">
                                {match.stock.size.toLocaleString()} sqft • {formatPrice(match.stock.price)}
                              </p>
                            </div>

                            <ArrowRight className="h-6 w-6 text-muted-foreground" />

                            {/* Request */}
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                              <Badge variant="outline" className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                                Request
                              </Badge>
                              <p className="font-medium line-clamp-1">{match.request.title}</p>
                              <p className="text-sm text-muted-foreground">{match.request.area}</p>
                              <p className="text-sm">
                                {match.request.size.toLocaleString()} sqft • {formatPrice(match.request.price)}
                              </p>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Match Reasons:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {match.reasons.map((reason, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-primary" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>

              {Object.keys(feedback).length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Your feedback helps train the AI to make better matches.
                  {Object.values(feedback).filter((f) => f === "good").length} positive,{" "}
                  {Object.values(feedback).filter((f) => f === "bad").length} negative ratings.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
