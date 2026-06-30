"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Plus, FileText, Eye, Users, Calendar, MessageSquare, Loader2, Trash2, ChevronDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from "sonner"
import type { LandlordReportData, ViewingEntry, LeadEntry } from "@/lib/pdf/landlord-report"

// Demo listings for selection
interface ListingOption {
  id: string
  title: string
  area: string
  type: string
  price: number
  transactionType: string
  bedrooms: number
  bathrooms: number
  size: number
  availability: string
  status: string
  ownerName: string
  createdAt: string
}

const demoListings: ListingOption[] = [
  { id: "1", title: "Luxury Villa with Pool", area: "Emirates Hills", type: "villa", price: 15000000, transactionType: "sale", bedrooms: 5, bathrooms: 6, size: 8500, availability: "Immediate", status: "live", ownerName: "Ahmed Hassan", createdAt: "2026-01-15" },
  { id: "2", title: "Modern Apartment Downtown", area: "Downtown Dubai", type: "apartment", price: 180000, transactionType: "rent", bedrooms: 2, bathrooms: 3, size: 1800, availability: "Q2 2026", status: "live", ownerName: "Sarah Miller", createdAt: "2026-01-10" },
  { id: "3", title: "Family Villa in Murooj", area: "Al Murooj", type: "villa", price: 8500000, transactionType: "sale", bedrooms: 4, bathrooms: 5, size: 5200, availability: "Negotiable", status: "pocket", ownerName: "Ahmed Hassan", createdAt: "2026-01-08" },
  { id: "4", title: "Penthouse Marina", area: "Dubai Marina", type: "penthouse", price: 450000, transactionType: "rent", bedrooms: 3, bathrooms: 4, size: 4200, availability: "March 2026", status: "live", ownerName: "Omar Khan", createdAt: "2026-01-12" },
  { id: "5", title: "6BR Mansion — Palm Jumeirah", area: "Palm Jumeirah", type: "villa", price: 45000000, transactionType: "sale", bedrooms: 6, bathrooms: 8, size: 15000, availability: "Immediate", status: "live", ownerName: "Omar Khan", createdAt: "2026-01-05" },
]

// Demo viewings for each listing
const demoViewings: Record<string, ViewingEntry[]> = {
  "1": [
    { date: "2026-03-25T10:00:00Z", viewerName: "John & Maria Williams", status: "completed", feedback: "Very impressed with the pool area and garden. Concerned about proximity to main road.", rating: 4 },
    { date: "2026-03-20T14:00:00Z", viewerName: "Rashid Al Maktoum", status: "completed", feedback: "Loved the property. Will discuss with family.", rating: 5 },
    { date: "2026-03-15T11:00:00Z", viewerName: "David Chen", status: "no_show", feedback: "", rating: null },
    { date: "2026-04-02T09:00:00Z", viewerName: "Sophie Turner", status: "scheduled", feedback: "", rating: null },
  ],
  "2": [
    { date: "2026-03-28T16:00:00Z", viewerName: "Alex Morgan", status: "completed", feedback: "Great view but small kitchen.", rating: 3 },
    { date: "2026-03-22T10:00:00Z", viewerName: "Fatima Noor", status: "completed", feedback: "Perfect for a young couple. Interested.", rating: 4 },
  ],
  "5": [
    { date: "2026-03-30T10:00:00Z", viewerName: "HNW Client (Private)", status: "completed", feedback: "Exceptional property. Second viewing requested.", rating: 5 },
    { date: "2026-03-27T14:00:00Z", viewerName: "Investment Group LLC", status: "completed", feedback: "Reviewing for portfolio acquisition. Very interested.", rating: 5 },
    { date: "2026-03-18T11:00:00Z", viewerName: "Royal Family Office", status: "completed", feedback: "Below expectations for this price point.", rating: 2 },
  ],
}

// Demo leads
const demoLeads: Record<string, LeadEntry[]> = {
  "1": [
    { name: "John Williams", source: "Property Finder", status: "viewing_scheduled", date: "2026-03-20", budget: 16000000 },
    { name: "Rashid Al Maktoum", source: "Referral", status: "negotiating", date: "2026-03-18", budget: 14000000 },
    { name: "David Chen", source: "Website", status: "contacted", date: "2026-03-14", budget: 15000000 },
    { name: "Sophie Turner", source: "Social Media", status: "qualified", date: "2026-03-28", budget: 15500000 },
    { name: "Anonymous Inquiry", source: "Bayut", status: "new", date: "2026-03-30", budget: null },
  ],
  "2": [
    { name: "Alex Morgan", source: "Direct", status: "qualified", date: "2026-03-25", budget: 200000 },
    { name: "Fatima Noor", source: "Property Finder", status: "offer_made", date: "2026-03-20", budget: 175000 },
    { name: "Mike Ross", source: "Referral", status: "new", date: "2026-03-29", budget: 190000 },
  ],
  "5": [
    { name: "HNW Client", source: "Referral", status: "negotiating", date: "2026-03-28", budget: 43000000 },
    { name: "Investment Group LLC", source: "Direct", status: "qualified", date: "2026-03-25", budget: 45000000 },
    { name: "Royal Family Office", source: "Referral", status: "closed_lost", date: "2026-03-15", budget: 40000000 },
  ],
}

const LEAD_SOURCES = ["direct", "property_finder", "bayut", "dubizzle", "website", "referral", "social_media", "walk_in", "other"]
const LEAD_STATUSES = ["new", "contacted", "qualified", "viewing_scheduled", "offer_made", "negotiating", "closed_won", "closed_lost"]
const VIEWING_STATUSES = ["scheduled", "completed", "cancelled", "no_show"]

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  viewing_scheduled: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
  offer_made: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  negotiating: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  closed_won: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  no_show: "bg-neutral-100 text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-400",
}

export default function LandlordReportPage() {
  const [selectedListingId, setSelectedListingId] = useState<string>("")
  const [viewings, setViewings] = useState<ViewingEntry[]>([])
  const [leads, setLeads] = useState<LeadEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAgentNotes, setShowAgentNotes] = useState(false)
  const [isAddViewingOpen, setIsAddViewingOpen] = useState(false)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [viewingsOpen, setViewingsOpen] = useState(true)
  const [leadsOpen, setLeadsOpen] = useState(true)

  // Editable report fields
  const [reportTitle, setReportTitle] = useState("Landlord Property Report")
  const [pricingNotes, setPricingNotes] = useState("")
  const [marketSummary, setMarketSummary] = useState("")
  const [agentNotes, setAgentNotes] = useState("")
  const [recommendations, setRecommendations] = useState("")

  // New viewing form
  const [newViewing, setNewViewing] = useState({
    viewerName: "",
    viewingDate: "",
    status: "scheduled",
    feedback: "",
    rating: "",
  })

  // New lead form
  const [newLead, setNewLead] = useState({
    name: "",
    source: "direct",
    status: "new",
    budget: "",
    date: new Date().toISOString().split("T")[0],
  })

  const selectedListing = demoListings.find((l) => l.id === selectedListingId)

  // Load data when listing changes
  const loadListingData = useCallback((listingId: string) => {
    const listing = demoListings.find((l) => l.id === listingId)
    if (!listing) return

    setViewings(demoViewings[listingId] || [])
    setLeads(demoLeads[listingId] || [])

    // Set default pricing notes based on listing
    const pricePerSqft = listing.size > 0 ? Math.round(listing.price / listing.size) : 0
    setPricingNotes(
      listing.transactionType === "sale"
        ? `Asking price: AED ${listing.price.toLocaleString()} (AED ${pricePerSqft}/sqft). Pricing is competitive for the ${listing.area} area based on recent comparable transactions.`
        : `Annual rent: AED ${listing.price.toLocaleString()} (AED ${Math.round(listing.price / 12).toLocaleString()}/month). In line with current market rates for ${listing.bedrooms}BR ${listing.type}s in ${listing.area}.`
    )
    setMarketSummary(
      `The ${listing.area} market continues to show strong demand for ${listing.type} properties. Average days on market for similar listings is approximately 30–45 days. Buyer/tenant interest remains healthy with steady inquiry volumes.`
    )
    setRecommendations("")
    setAgentNotes("")
    setReportTitle("Landlord Property Report")
  }, [])

  useEffect(() => {
    if (selectedListingId) {
      loadListingData(selectedListingId)
    }
  }, [selectedListingId, loadListingData])

  const getDaysOnMarket = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getLeadSources = () => {
    const sourceMap = new Map<string, number>()
    leads.forEach((lead) => {
      const source = lead.source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1)
    })
    return Array.from(sourceMap, ([source, count]) => ({ source, count })).sort(
      (a, b) => b.count - a.count
    )
  }

  const getAvgRating = () => {
    const rated = viewings.filter((v) => v.rating !== null && v.rating > 0)
    if (rated.length === 0) return 0
    return rated.reduce((sum, v) => sum + (v.rating || 0), 0) / rated.length
  }

  const handleAddViewing = () => {
    if (!newViewing.viewerName || !newViewing.viewingDate) {
      toast.error("Please fill in viewer name and date")
      return
    }
    const entry: ViewingEntry = {
      viewerName: newViewing.viewerName,
      date: new Date(newViewing.viewingDate).toISOString(),
      status: newViewing.status,
      feedback: newViewing.feedback,
      rating: newViewing.rating ? parseInt(newViewing.rating) : null,
    }
    setViewings([entry, ...viewings])
    setNewViewing({ viewerName: "", viewingDate: "", status: "scheduled", feedback: "", rating: "" })
    setIsAddViewingOpen(false)
    toast.success("Viewing added")
  }

  const handleAddLead = () => {
    if (!newLead.name) {
      toast.error("Please fill in lead name")
      return
    }
    const entry: LeadEntry = {
      name: newLead.name,
      source: newLead.source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      status: newLead.status,
      budget: newLead.budget ? parseFloat(newLead.budget) : null,
      date: newLead.date,
    }
    setLeads([entry, ...leads])
    setNewLead({ name: "", source: "direct", status: "new", budget: "", date: new Date().toISOString().split("T")[0] })
    setIsAddLeadOpen(false)
    toast.success("Lead added")
  }

  const handleRemoveViewing = (index: number) => {
    setViewings(viewings.filter((_, i) => i !== index))
  }

  const handleRemoveLead = (index: number) => {
    setLeads(leads.filter((_, i) => i !== index))
  }

  const handleGenerateReport = async () => {
    if (!selectedListing) return

    setIsGenerating(true)
    try {
      const reportData: LandlordReportData = {
        propertyTitle: selectedListing.title,
        propertyType: selectedListing.type.charAt(0).toUpperCase() + selectedListing.type.slice(1),
        area: selectedListing.area,
        bedrooms: selectedListing.bedrooms,
        bathrooms: selectedListing.bathrooms,
        size: selectedListing.size,
        price: selectedListing.price,
        transactionType: selectedListing.transactionType,
        availability: selectedListing.availability,
        listingStatus: selectedListing.status,
        daysOnMarket: getDaysOnMarket(selectedListing.createdAt),
        agentName: "Ahmed Hassan",
        agentPhone: "+971 50 123 4567",
        agentEmail: "ahmed@zaylo.ae",
        reportDate: new Date().toISOString(),
        reportTitle,
        pricingNotes,
        marketSummary,
        agentNotes: showAgentNotes ? agentNotes : "",
        recommendations,
        leads,
        viewings,
        totalLeads: leads.length,
        totalViewings: viewings.length,
        totalInquiries: leads.filter((l) => l.status !== "closed_lost").length,
        avgInterestRating: getAvgRating(),
        leadSources: getLeadSources(),
      }

      const response = await fetch("/api/reports/landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) throw new Error("Failed to generate report")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `landlord-report-${selectedListing.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`
    return `AED ${amount.toLocaleString()}`
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Landlord Report</h1>
          <p className="text-muted-foreground">
            Generate investor briefs with leads, viewings, and market insights
          </p>
        </div>
      </div>

      {/* Listing Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Property</CardTitle>
          <CardDescription>Choose which listing to generate a report for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedListingId} onValueChange={setSelectedListingId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a listing..." />
            </SelectTrigger>
            <SelectContent>
              {demoListings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id}>
                  <span className="flex items-center gap-2">
                    {listing.title} — {listing.area} — {formatCurrency(listing.price)}
                    <Badge variant="outline" className="ml-1 text-xs">
                      {listing.transactionType === "sale" ? "Sale" : "Rent"}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedListing && (
        <>
          {/* Property Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="h-4 w-4" />
                  Total Leads
                </div>
                <p className="text-2xl font-bold">{leads.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Eye className="h-4 w-4" />
                  Viewings
                </div>
                <p className="text-2xl font-bold">{viewings.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  Days on Market
                </div>
                <p className="text-2xl font-bold">{getDaysOnMarket(selectedListing.createdAt)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Star className="h-4 w-4" />
                  Avg Interest
                </div>
                <p className="text-2xl font-bold">
                  {getAvgRating() > 0 ? `${getAvgRating().toFixed(1)}/5` : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left: Viewings */}
            <Collapsible open={viewingsOpen} onOpenChange={setViewingsOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                      <CardTitle className="text-base">Viewings</CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${viewingsOpen ? "" : "-rotate-90"}`} />
                    </CollapsibleTrigger>
                    <Button size="sm" variant="outline" onClick={() => setIsAddViewingOpen(true)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {viewings.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No viewings recorded yet</p>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {viewings.map((v, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 border rounded-lg group">
                            <div className="w-2 h-2 rounded-full bg-foreground mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{v.viewerName}</span>
                                <Badge className={`text-[10px] ${statusColors[v.status] || ""}`}>
                                  {v.status.replace(/_/g, " ")}
                                </Badge>
                                {v.rating && (
                                  <span className="text-xs text-muted-foreground">
                                    {v.rating}/5
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(v.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {v.feedback && (
                                <p className="text-xs text-muted-foreground mt-1 italic">&quot;{v.feedback}&quot;</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => handleRemoveViewing(i)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Right: Leads */}
            <Collapsible open={leadsOpen} onOpenChange={setLeadsOpen}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                      <CardTitle className="text-base">Leads</CardTitle>
                      <ChevronDown className={`h-4 w-4 transition-transform ${leadsOpen ? "" : "-rotate-90"}`} />
                    </CollapsibleTrigger>
                    <Button size="sm" variant="outline" onClick={() => setIsAddLeadOpen(true)}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {leads.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No leads recorded yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Source</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Budget</TableHead>
                            <TableHead className="text-xs w-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads.map((lead, i) => (
                            <TableRow key={i} className="group">
                              <TableCell className="text-sm py-2">{lead.name}</TableCell>
                              <TableCell className="text-sm py-2">{lead.source}</TableCell>
                              <TableCell className="py-2">
                                <Badge className={`text-[10px] ${statusColors[lead.status] || ""}`}>
                                  {lead.status.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm py-2">
                                {lead.budget ? formatCurrency(lead.budget) : "—"}
                              </TableCell>
                              <TableCell className="py-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveLead(i)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Report Content (editable) */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Report Content
              </CardTitle>
              <CardDescription>Edit the content that will appear in the downloaded report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Title</Label>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Landlord Property Report"
                />
              </div>

              <div className="space-y-2">
                <Label>Pricing Commentary</Label>
                <Textarea
                  value={pricingNotes}
                  onChange={(e) => setPricingNotes(e.target.value)}
                  placeholder="Add notes about pricing, comparables, market positioning..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Market Summary</Label>
                <Textarea
                  value={marketSummary}
                  onChange={(e) => setMarketSummary(e.target.value)}
                  placeholder="Summarize current market conditions for this area..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Recommendations</Label>
                <Textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Recommendations for the landlord/investor..."
                  rows={3}
                />
              </div>

              {/* Agent Notes Toggle */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="cursor-pointer">Agent Notes</Label>
                    <span className="text-xs text-muted-foreground">(optional — will appear in report if enabled)</span>
                  </div>
                  <Switch checked={showAgentNotes} onCheckedChange={setShowAgentNotes} />
                </div>
                {showAgentNotes && (
                  <Textarea
                    value={agentNotes}
                    onChange={(e) => setAgentNotes(e.target.value)}
                    placeholder="Personal notes, observations, strategy notes for the landlord..."
                    rows={4}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-end mb-8">
            <Button
              size="lg"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Landlord Report
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Add Viewing Dialog */}
      <Dialog open={isAddViewingOpen} onOpenChange={setIsAddViewingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Viewing</DialogTitle>
            <DialogDescription>Record a property viewing for this listing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Viewer Name *</Label>
              <Input
                value={newViewing.viewerName}
                onChange={(e) => setNewViewing({ ...newViewing, viewerName: e.target.value })}
                placeholder="Name of the viewer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={newViewing.viewingDate}
                  onChange={(e) => setNewViewing({ ...newViewing, viewingDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newViewing.status}
                  onValueChange={(v) => setNewViewing({ ...newViewing, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIEWING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Interest Rating (1-5)</Label>
              <Select
                value={newViewing.rating}
                onValueChange={(v) => setNewViewing({ ...newViewing, rating: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Not Interested</SelectItem>
                  <SelectItem value="2">2 - Slightly Interested</SelectItem>
                  <SelectItem value="3">3 - Interested</SelectItem>
                  <SelectItem value="4">4 - Very Interested</SelectItem>
                  <SelectItem value="5">5 - Extremely Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Feedback / Comments</Label>
              <Textarea
                value={newViewing.feedback}
                onChange={(e) => setNewViewing({ ...newViewing, feedback: e.target.value })}
                placeholder="Agent observations, viewer feedback..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddViewingOpen(false)}>Cancel</Button>
            <Button onClick={handleAddViewing}>Add Viewing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>Record a new lead/inquiry for this listing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lead Name *</Label>
              <Input
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="Name of the lead"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={newLead.source}
                  onValueChange={(v) => setNewLead({ ...newLead, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newLead.status}
                  onValueChange={(v) => setNewLead({ ...newLead, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget (AED)</Label>
                <Input
                  type="number"
                  value={newLead.budget}
                  onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                  placeholder="Budget amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newLead.date}
                  onChange={(e) => setNewLead({ ...newLead, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLead}>Add Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
