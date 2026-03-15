"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { marketUpdatesStore, type MarketUpdate } from "@/lib/market-updates-store"
import { useRole } from "@/contexts/role-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Calendar, User, Tag, Lock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function MarketUpdatesFeed() {
  const { isCustomer, isAdmin } = useRole()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Subscribe to store updates
  const updates = useSyncExternalStore(
    marketUpdatesStore.subscribe,
    () => marketUpdatesStore.getPublished(),
    () => marketUpdatesStore.getPublished()
  )

  // Access check: only customers and admins
  const hasAccess = isCustomer || isAdmin
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Market Updates are only available to registered customers. Please sign in with a customer account to view this content.
        </p>
      </div>
    )
  }

  // Collect all unique tags
  const allTags = Array.from(new Set(updates.flatMap((u) => u.tags))).sort()

  // Filter
  const filtered = updates.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTag = !selectedTag || u.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No market updates found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((update) => {
            const isExpanded = expandedId === update.id
            return (
              <Card
                key={update.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setExpandedId(isExpanded ? null : update.id)}
              >
                {update.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={update.imageUrl}
                      alt={update.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-tight">
                      {update.title}
                    </h3>
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(update.publishedAt!)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {update.author}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {isExpanded ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                      {update.body}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {update.excerpt}
                    </p>
                  )}
                  {update.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {update.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
