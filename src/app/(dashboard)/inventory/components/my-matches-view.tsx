"use client"

import { ArrowRight, Sparkles, MessageCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(price)
}

export function MyMatchesView({ matches }: MyMatchesViewProps) {
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          You have {matches.length} potential match{matches.length !== 1 ? "es" : ""} involving your listings
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => {
          const matchId = `${match.stock.id}-${match.request.id}`
          const isMyStock = true // In a real app, check against current user

          return (
            <Card key={matchId} className="overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge
                      variant={match.score >= 70 ? "default" : "secondary"}
                      className={match.score >= 70 ? "bg-green-600" : ""}
                    >
                      {match.score}% Match
                    </Badge>
                    {match.score >= 70 && (
                      <span className="text-xs text-green-600 font-medium">Strong match!</span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
                  {/* Stock Listing */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Stock Listing
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {match.stock.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-lg">{match.stock.title}</p>
                    <p className="text-muted-foreground">{match.stock.area}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-medium">{formatPrice(match.stock.price)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <p className="font-medium">{match.stock.size.toLocaleString()} sqft</p>
                      </div>
                      {match.stock.bedrooms && (
                        <div>
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <p className="font-medium">{match.stock.bedrooms} BR</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{match.stock.type}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Agent:</span>
                      <p className="font-medium">{match.stock.ownerName}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center h-full">
                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex md:hidden items-center justify-center py-2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                  </div>

                  {/* Request */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        Buyer Request
                      </Badge>
                    </div>
                    <p className="font-semibold text-lg">{match.request.title}</p>
                    <p className="text-muted-foreground">{match.request.area}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <p className="font-medium">{formatPrice(match.request.price)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size needed:</span>
                        <p className="font-medium">{match.request.size.toLocaleString()} sqft</p>
                      </div>
                      {match.request.bedrooms && (
                        <div>
                          <span className="text-muted-foreground">Bedrooms:</span>
                          <p className="font-medium">{match.request.bedrooms} BR</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{match.request.type}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Agent:</span>
                      <p className="font-medium">{match.request.ownerName}</p>
                    </div>
                    {match.request.notes && (
                      <div className="mt-3 p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded text-sm">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="text-xs mt-1">{match.request.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Why this is a good match:
                  </p>
                  <ul className="grid grid-cols-2 gap-1">
                    {match.reasons.map((reason, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
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
    </div>
  )
}
