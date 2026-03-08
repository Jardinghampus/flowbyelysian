"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Filter, MapPin, Bed, DollarSign, Bell, Trash2, ArrowRight, ShieldCheck, Maximize2, Eye, X } from "lucide-react"
import { useRole } from "@/contexts/role-context"
import { sampleRequests, type ExchangeRequest, requestTypeConfig } from "@/lib/data/exchange-data"
import { findMatches, type MatchResult, type MatchCriteria } from "@/lib/matching-engine"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface PropertyRequest {
  id: string
  title: string
  propertyType: string
  transactionType: "buy" | "rent"
  area: string
  minBedrooms: number
  maxBudget: number
  notes: string
  status: "active" | "matched" | "closed"
  watchlist: boolean
  matchCount: number
  createdAt: string
}

const DEMO_REQUESTS: PropertyRequest[] = [
  {
    id: "1",
    title: "Family Villa in Palm Jumeirah",
    propertyType: "villa",
    transactionType: "buy",
    area: "Palm Jumeirah",
    minBedrooms: 4,
    maxBudget: 25000000,
    notes: "Beachfront preferred, private pool is a must. Looking for signature villas.",
    status: "active",
    watchlist: true,
    matchCount: 3,
    createdAt: "2025-12-15",
  },
  {
    id: "2",
    title: "Apartment for Rent - Marina",
    propertyType: "apartment",
    transactionType: "rent",
    area: "Dubai Marina",
    minBedrooms: 2,
    maxBudget: 180000,
    notes: "High floor, marina view preferred. Need parking.",
    status: "active",
    watchlist: true,
    matchCount: 7,
    createdAt: "2026-01-03",
  },
  {
    id: "3",
    title: "Investment Apartment Downtown",
    propertyType: "apartment",
    transactionType: "buy",
    area: "Downtown Dubai",
    minBedrooms: 1,
    maxBudget: 3500000,
    notes: "High rental yield priority. Preferably near mall or metro.",
    status: "matched",
    watchlist: false,
    matchCount: 12,
    createdAt: "2025-11-20",
  },
]

function requestToCriteria(request: PropertyRequest): MatchCriteria {
  return {
    area: request.area,
    propertyType: request.propertyType,
    transactionType: request.transactionType,
    minBedrooms: request.minBedrooms,
    maxBudget: request.maxBudget,
    features: [],
  }
}

export default function RequestsPage() {
  const { role, canCreateRequest, isInternal } = useRole()
  const [requests, setRequests] = useState<PropertyRequest[]>(DEMO_REQUESTS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "matched" | "closed">("all")
  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(null)
  const [newRequest, setNewRequest] = useState({
    title: "",
    propertyType: "apartment",
    transactionType: "buy" as "buy" | "rent",
    area: "",
    minBedrooms: 1,
    maxBudget: 0,
    notes: "",
    watchlist: true,
  })

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((r) => r.status === filterStatus)

  const matchingRequest = requests.find((r) => r.id === matchingRequestId)
  const matchedListings = useMemo((): MatchResult[] => {
    if (!matchingRequest) return []
    const criteria = requestToCriteria(matchingRequest)
    const sellOrLease = sampleRequests.filter((l) => l.type === "sell" || l.type === "lease")
    return findMatches(criteria, sellOrLease, 25)
  }, [matchingRequest])

  const handleCreate = () => {
    if (!newRequest.title || !newRequest.area) {
      toast.error("Title and area are required")
      return
    }
    const request: PropertyRequest = {
      ...newRequest,
      id: Date.now().toString(),
      status: "active",
      matchCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setRequests([request, ...requests])
    setIsCreateOpen(false)
    setNewRequest({
      title: "",
      propertyType: "apartment",
      transactionType: "buy",
      area: "",
      minBedrooms: 1,
      maxBudget: 0,
      notes: "",
      watchlist: true,
    })
    toast.success("Request created", {
      description: newRequest.watchlist
        ? "You will be notified when matching properties are listed."
        : "Your request has been submitted to our agents.",
    })
  }

  const handleDelete = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id))
    toast.success("Request removed")
  }

  const toggleWatchlist = (id: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, watchlist: !r.watchlist } : r
      )
    )
  }

  const formatBudget = (amount: number, type: "buy" | "rent") => {
    if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M${type === "rent" ? "/yr" : ""}`
    return `AED ${amount.toLocaleString()}${type === "rent" ? "/yr" : ""}`
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isInternal ? "Client Requests" : "My Requests & Watchlists"}
            </h1>
            <p className="text-muted-foreground">
              {isInternal
                ? "Manage property search requests from clients"
                : "Create property searches and get notified when matching listings appear"
              }
            </p>
          </div>
          {canCreateRequest && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Property Request</DialogTitle>
                  <DialogDescription>
                    Describe what you are looking for. Enable watchlist to get alerts when matching properties appear.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g. Family Villa in Palm Jumeirah"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Transaction</Label>
                      <Select
                        value={newRequest.transactionType}
                        onValueChange={(v: "buy" | "rent") => setNewRequest({ ...newRequest, transactionType: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Property Type</Label>
                      <Select
                        value={newRequest.propertyType}
                        onValueChange={(v) => setNewRequest({ ...newRequest, propertyType: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Area</Label>
                      <Select
                        value={newRequest.area}
                        onValueChange={(v) => setNewRequest({ ...newRequest, area: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Palm Jumeirah">Palm Jumeirah</SelectItem>
                          <SelectItem value="Dubai Marina">Dubai Marina</SelectItem>
                          <SelectItem value="Downtown Dubai">Downtown Dubai</SelectItem>
                          <SelectItem value="Emirates Hills">Emirates Hills</SelectItem>
                          <SelectItem value="Arabian Ranches">Arabian Ranches</SelectItem>
                          <SelectItem value="Tilal Al Ghaf">Tilal Al Ghaf</SelectItem>
                          <SelectItem value="Business Bay">Business Bay</SelectItem>
                          <SelectItem value="JBR">JBR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Min Bedrooms</Label>
                      <Select
                        value={newRequest.minBedrooms.toString()}
                        onValueChange={(v) => setNewRequest({ ...newRequest, minBedrooms: parseInt(v) })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Max Budget (AED)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000000"
                      value={newRequest.maxBudget || ""}
                      onChange={(e) => setNewRequest({ ...newRequest, maxBudget: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Any specific requirements, preferences, or must-haves..."
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="watchlist-toggle" className="font-medium">Enable Watchlist</Label>
                      <p className="text-sm text-muted-foreground">Get notified when matching properties are listed</p>
                    </div>
                    <Switch
                      id="watchlist-toggle"
                      checked={newRequest.watchlist}
                      onCheckedChange={(v) => setNewRequest({ ...newRequest, watchlist: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>Create Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "matched", "closed"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
              {status !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {requests.filter((r) => r.status === status).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Request Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {request.createdAt}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        request.status === "active" ? "default" :
                        request.status === "matched" ? "secondary" : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.area}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {request.minBedrooms}+ BR
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatBudget(request.maxBudget, request.transactionType)}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {request.propertyType}
                  </Badge>
                  <Badge variant={request.transactionType === "buy" ? "default" : "secondary"}>
                    {request.transactionType === "buy" ? "Buy" : "Rent"}
                  </Badge>
                </div>

                {request.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{request.notes}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMatchingRequestId(matchingRequestId === request.id ? null : request.id)}
                      className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View matches
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => toggleWatchlist(request.id)}
                      className={`flex items-center gap-1 text-sm ${request.watchlist ? "text-blue-600" : "text-muted-foreground"}`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      {request.watchlist ? "Watching" : "Watch"}
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(request.id)}
                    className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No requests found</p>
            <p className="text-muted-foreground mb-4">
              {filterStatus !== "all"
                ? `No ${filterStatus} requests. Try a different filter.`
                : "Create your first property request to get started."
              }
            </p>
            {canCreateRequest && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Button>
            )}
          </div>
        )}

        {/* Matching Panel */}
        <AnimatePresence>
          {matchingRequest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="overflow-hidden mt-8"
            >
              <div className="rounded-xl border bg-gradient-to-b from-primary/5 to-transparent p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Matching Listings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Off-market units matching &ldquo;{matchingRequest.title}&rdquo;
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMatchingRequestId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {matchedListings.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {matchedListings.map(({ listing, totalScore, breakdown }) => {
                      const typeConf = requestTypeConfig[listing.type]
                      return (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border bg-white dark:bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {listing.area}
                                {listing.subArea && (
                                  <span className="text-primary">&middot; {listing.subArea}</span>
                                )}
                              </div>
                            </div>
                            <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0 ${
                              totalScore >= 70 ? "bg-green-500 text-white" :
                              totalScore >= 45 ? "bg-blue-500 text-white" :
                              "bg-amber-500 text-white"
                            }`}>
                              {totalScore}%
                            </div>
                          </div>

                          {/* Score breakdown bars */}
                          <div className="grid grid-cols-4 gap-1">
                            {([
                              { key: "area" as const, label: "Area" },
                              { key: "type" as const, label: "Type" },
                              { key: "price" as const, label: "Price" },
                              { key: "features" as const, label: "Feat." },
                            ]).map(({ key, label }) => (
                              <div key={key} className="text-center">
                                <div className="h-1 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      breakdown[key] >= 70 ? "bg-green-500" :
                                      breakdown[key] >= 40 ? "bg-blue-500" :
                                      "bg-amber-500"
                                    }`}
                                    style={{ width: `${breakdown[key]}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-muted-foreground">{label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {listing.bedrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <Bed className="h-3 w-3" /> {listing.bedrooms} BR
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3 w-3" /> {listing.minSize.toLocaleString()} sqft
                            </span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 capitalize">
                              {listing.propertyType}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">
                              AED {listing.minBudget >= 1000000
                                ? `${(listing.minBudget / 1000000).toFixed(1)}M`
                                : listing.minBudget.toLocaleString()}
                              {listing.type === "lease" ? "/yr" : ""}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeConf.bg} ${typeConf.text}`}>
                              {typeConf.label}
                            </span>
                          </div>

                          {listing.isOffMarket && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                              Off-Market
                            </span>
                          )}

                          <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                              toast.success("Agent notified!", {
                                description: `A Zaylo agent will connect you regarding "${listing.title}".`,
                                duration: 4000,
                              })
                            }}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                            Request Agent Contact
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No matching listings found yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">New off-market units are added daily — you&apos;ll be notified when matches appear.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
