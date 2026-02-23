"use client"

import { useState } from "react"
import { Plus, Search, Filter, MapPin, Bed, DollarSign, Bell, Trash2 } from "lucide-react"
import { useRole } from "@/contexts/role-context"
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

export default function RequestsPage() {
  const { role, canCreateRequest, isInternal } = useRole()
  const [requests, setRequests] = useState<PropertyRequest[]>(DEMO_REQUESTS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "matched" | "closed">("all")
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
                    {request.matchCount > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        {request.matchCount} matches
                      </span>
                    )}
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
      </div>
    </>
  )
}
