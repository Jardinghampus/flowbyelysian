"use client"

import { useState, useCallback } from "react"
import {
  Search,
  Plus,
  Bell,
  BellOff,
  MapPin,
  Bed,
  Bath,
  DollarSign,
  Building2,
  Home,
  Maximize,
  SlidersHorizontal,
  Trash2,
  Pencil,
  Eye,
  Check,
  X,
  ArrowUpDown,
  TrendingUp,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { villaCommunities, formatPrice } from "@/lib/data/villa-communities"

interface SearchProfile {
  id: string
  name: string
  transactionType: "buy" | "rent"
  propertyTypes: string[]
  areas: string[]
  minBedrooms: number
  maxBedrooms: number
  minBudget: number
  maxBudget: number
  minSize: number
  maxSize: number
  mustHaveFeatures: string[]
  notes: string
  notifications: boolean
  notificationFrequency: "instant" | "daily" | "weekly"
  matchCount: number
  newMatches: number
  createdAt: string
  lastNotified: string | null
}

interface MatchedUnit {
  id: string
  title: string
  area: string
  type: string
  bedrooms: number
  bathrooms: number
  size: number
  price: number
  image: string
  matchScore: number
  isNew: boolean
  listedDate: string
}

const PROPERTY_TYPES = ["Villa", "Townhouse", "Mansion"]
const FEATURES = [
  "Private Pool",
  "Garden",
  "Maid's Room",
  "Driver's Room",
  "Golf View",
  "Lagoon View",
  "Beach Access",
  "Smart Home",
  "Upgraded Kitchen",
  "Corner Plot",
  "Basement",
  "Home Cinema",
  "Gym",
  "Rooftop Terrace",
]

const AREAS = villaCommunities.map((c) => ({ label: c.name, value: c.slug }))

const DEMO_PROFILES: SearchProfile[] = [
  {
    id: "1",
    name: "Family Villa - Lagoon Community",
    transactionType: "buy",
    propertyTypes: ["Villa"],
    areas: ["tilal-al-ghaf"],
    minBedrooms: 4,
    maxBedrooms: 6,
    minBudget: 5000000,
    maxBudget: 15000000,
    minSize: 4000,
    maxSize: 8000,
    mustHaveFeatures: ["Private Pool", "Garden", "Maid's Room"],
    notes: "Prefer lagoon view or park facing. Need to be close to school.",
    notifications: true,
    notificationFrequency: "instant",
    matchCount: 8,
    newMatches: 3,
    createdAt: "2025-12-01",
    lastNotified: "2026-02-22",
  },
  {
    id: "2",
    name: "Golf Course Investment",
    transactionType: "buy",
    propertyTypes: ["Villa", "Townhouse"],
    areas: ["damac-hills", "jumeirah-golf-estates"],
    minBedrooms: 3,
    maxBedrooms: 5,
    minBudget: 2000000,
    maxBudget: 8000000,
    minSize: 2500,
    maxSize: 6000,
    mustHaveFeatures: ["Golf View"],
    notes: "Investment property. Looking for strong rental yield above 6%.",
    notifications: true,
    notificationFrequency: "daily",
    matchCount: 15,
    newMatches: 5,
    createdAt: "2026-01-10",
    lastNotified: "2026-02-21",
  },
  {
    id: "3",
    name: "Al Furjan Rental",
    transactionType: "rent",
    propertyTypes: ["Townhouse", "Villa"],
    areas: ["al-furjan"],
    minBedrooms: 3,
    maxBedrooms: 4,
    minBudget: 100000,
    maxBudget: 200000,
    minSize: 2000,
    maxSize: 3500,
    mustHaveFeatures: ["Garden", "Maid's Room"],
    notes: "Family with 2 kids. Need near school and metro.",
    notifications: true,
    notificationFrequency: "weekly",
    matchCount: 12,
    newMatches: 2,
    createdAt: "2026-02-05",
    lastNotified: "2026-02-18",
  },
]

const DEMO_MATCHES: MatchedUnit[] = [
  {
    id: "m1",
    title: "Harmony 5BR Villa - Park View",
    area: "Tilal Al Ghaf",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    size: 5200,
    price: 9800000,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
    matchScore: 95,
    isNew: true,
    listedDate: "2026-02-21",
  },
  {
    id: "m2",
    title: "Aura 4BR - Lagoon Access",
    area: "Tilal Al Ghaf",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 5,
    size: 4800,
    price: 8200000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
    matchScore: 88,
    isNew: true,
    listedDate: "2026-02-20",
  },
  {
    id: "m3",
    title: "Elan Corner Townhouse",
    area: "Tilal Al Ghaf",
    type: "Townhouse",
    bedrooms: 4,
    bathrooms: 4,
    size: 3200,
    price: 5500000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    matchScore: 72,
    isNew: false,
    listedDate: "2026-02-15",
  },
  {
    id: "m4",
    title: "Golf View 5BR - DAMAC Hills",
    area: "DAMAC Hills",
    type: "Villa",
    bedrooms: 5,
    bathrooms: 6,
    size: 5500,
    price: 6800000,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    matchScore: 82,
    isNew: true,
    listedDate: "2026-02-22",
  },
  {
    id: "m5",
    title: "Lime Tree Valley 4BR",
    area: "JGE",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 5,
    size: 4200,
    price: 7200000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    matchScore: 76,
    isNew: false,
    listedDate: "2026-02-12",
  },
]

const defaultNewProfile = {
  name: "",
  transactionType: "buy" as "buy" | "rent",
  propertyTypes: [] as string[],
  areas: [] as string[],
  minBedrooms: 3,
  maxBedrooms: 6,
  minBudget: 1000000,
  maxBudget: 15000000,
  minSize: 2000,
  maxSize: 10000,
  mustHaveFeatures: [] as string[],
  notes: "",
  notifications: true,
  notificationFrequency: "daily" as "instant" | "daily" | "weekly",
}

export default function MySearchPage() {
  const [profiles, setProfiles] = useState<SearchProfile[]>(DEMO_PROFILES)
  const [activeProfile, setActiveProfile] = useState<string>("1")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newProfile, setNewProfile] = useState(defaultNewProfile)
  const [editProfile, setEditProfile] = useState<SearchProfile | null>(null)
  const [sortBy, setSortBy] = useState<"matchScore" | "price" | "date">("matchScore")

  const currentProfile = profiles.find((p) => p.id === activeProfile)

  const togglePropertyType = useCallback((types: string[], type: string) => {
    return types.includes(type) ? types.filter((t) => t !== type) : [...types, type]
  }, [])

  const toggleFeature = useCallback((features: string[], feat: string) => {
    return features.includes(feat) ? features.filter((f) => f !== feat) : [...features, feat]
  }, [])

  const toggleArea = useCallback((areas: string[], area: string) => {
    return areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area]
  }, [])

  const handleCreate = () => {
    if (!newProfile.name) {
      toast.error("Please give your search a name")
      return
    }
    if (newProfile.areas.length === 0) {
      toast.error("Please select at least one area")
      return
    }
    const profile: SearchProfile = {
      ...newProfile,
      id: Date.now().toString(),
      matchCount: 0,
      newMatches: 0,
      createdAt: new Date().toISOString().split("T")[0],
      lastNotified: null,
    }
    setProfiles([profile, ...profiles])
    setActiveProfile(profile.id)
    setIsCreateOpen(false)
    setNewProfile(defaultNewProfile)
    toast.success("Search profile created", {
      description: newProfile.notifications
        ? `You'll receive ${newProfile.notificationFrequency} notifications for matching properties.`
        : "Your search profile has been saved.",
    })
  }

  const handleEdit = () => {
    if (!editProfile) return
    setProfiles(profiles.map((p) => (p.id === editProfile.id ? editProfile : p)))
    setIsEditOpen(false)
    toast.success("Search profile updated")
  }

  const handleDelete = (id: string) => {
    setProfiles(profiles.filter((p) => p.id !== id))
    if (activeProfile === id && profiles.length > 1) {
      setActiveProfile(profiles.find((p) => p.id !== id)?.id || "")
    }
    toast.success("Search profile removed")
  }

  const toggleNotifications = (id: string) => {
    setProfiles(profiles.map((p) =>
      p.id === id ? { ...p, notifications: !p.notifications } : p
    ))
  }

  const sortedMatches = [...DEMO_MATCHES].sort((a, b) => {
    if (sortBy === "matchScore") return b.matchScore - a.matchScore
    if (sortBy === "price") return a.price - b.price
    return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime()
  })

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Search</h1>
            <p className="text-muted-foreground">
              Manage your search profiles, adjust criteria, and view matching properties.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Search Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Search Profile</DialogTitle>
                <DialogDescription>
                  Set your criteria and get notified when matching properties appear.
                </DialogDescription>
              </DialogHeader>
              <SearchProfileForm
                data={newProfile}
                onChange={setNewProfile}
                togglePropertyType={(t) => setNewProfile({ ...newProfile, propertyTypes: togglePropertyType(newProfile.propertyTypes, t) })}
                toggleFeature={(f) => setNewProfile({ ...newProfile, mustHaveFeatures: toggleFeature(newProfile.mustHaveFeatures, f) })}
                toggleArea={(a) => setNewProfile({ ...newProfile, areas: toggleArea(newProfile.areas, a) })}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Profile</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-4 lg:px-6 mt-6">
        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profiles">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Search Profiles ({profiles.length})
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Sparkles className="mr-2 h-4 w-4" />
              Matched Units ({DEMO_MATCHES.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Profiles Tab */}
          <TabsContent value="profiles">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => (
                <Card key={profile.id} className={`relative group transition-all ${activeProfile === profile.id ? "ring-2 ring-blue-600" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{profile.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created {profile.createdAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {profile.newMatches > 0 && (
                          <Badge className="bg-blue-600 text-white">
                            {profile.newMatches} new
                          </Badge>
                        )}
                        <Badge variant={profile.transactionType === "buy" ? "default" : "secondary"}>
                          {profile.transactionType === "buy" ? "Buy" : "Rent"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Criteria Summary */}
                    <div className="flex flex-wrap gap-1.5">
                      {profile.areas.map((a) => (
                        <Badge key={a} variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {villaCommunities.find((c) => c.slug === a)?.name || a}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Bed className="h-3 w-3" /> {profile.minBedrooms}-{profile.maxBedrooms} BR
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(profile.minBudget)} - {formatPrice(profile.maxBudget)}
                      </Badge>
                    </div>

                    {profile.propertyTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.propertyTypes.map((t) => (
                          <Badge key={t} variant="outline" className="flex items-center gap-1">
                            <Home className="h-3 w-3" /> {t}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {profile.mustHaveFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.mustHaveFeatures.map((f) => (
                          <span key={f} className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs">
                            <Check className="h-3 w-3" /> {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {profile.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{profile.notes}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {profile.matchCount} matches
                        </span>
                        <button
                          onClick={() => toggleNotifications(profile.id)}
                          className={`flex items-center gap-1 text-sm ${profile.notifications ? "text-blue-600" : "text-muted-foreground"}`}
                        >
                          {profile.notifications ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                          {profile.notifications ? profile.notificationFrequency : "Off"}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveProfile(profile.id)}
                          className="text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditProfile(profile)
                            setIsEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(profile.id)}
                          className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {profiles.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No search profiles yet</p>
                  <p className="text-muted-foreground mb-4">
                    Create your first search profile to start finding matching properties.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Search Profile
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Matched Units Tab */}
          <TabsContent value="matches">
            {currentProfile && (
              <div className="mb-6 rounded-xl bg-muted/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Showing matches for:</p>
                  <p className="font-semibold">{currentProfile.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matchScore">Match Score</SelectItem>
                      <SelectItem value="price">Price (Low to High)</SelectItem>
                      <SelectItem value="date">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedMatches.map((unit) => (
                <Card key={unit.id} className="group overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={unit.image}
                      alt={unit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {unit.isNew && (
                        <Badge className="bg-blue-600 text-white">New Match</Badge>
                      )}
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-neutral-700">
                        {unit.type}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        unit.matchScore >= 90 ? "bg-green-500 text-white" :
                        unit.matchScore >= 75 ? "bg-blue-500 text-white" :
                        "bg-amber-500 text-white"
                      }`}>
                        {unit.matchScore}% match
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{unit.title}</h3>
                    <p className="text-xl font-bold text-blue-600 mb-3">{formatPrice(unit.price)}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {unit.area}</span>
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {unit.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {unit.bathrooms}</span>
                      <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {unit.size.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground">Listed {unit.listedDate}</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Search Profile</DialogTitle>
            <DialogDescription>
              Update your criteria to refine your property matches.
            </DialogDescription>
          </DialogHeader>
          {editProfile && (
            <SearchProfileForm
              data={editProfile}
              onChange={(data) => setEditProfile({ ...editProfile, ...data })}
              togglePropertyType={(t) => setEditProfile({ ...editProfile, propertyTypes: togglePropertyType(editProfile.propertyTypes, t) })}
              toggleFeature={(f) => setEditProfile({ ...editProfile, mustHaveFeatures: toggleFeature(editProfile.mustHaveFeatures, f) })}
              toggleArea={(a) => setEditProfile({ ...editProfile, areas: toggleArea(editProfile.areas, a) })}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface SearchProfileFormData {
  name: string
  transactionType: "buy" | "rent"
  propertyTypes: string[]
  areas: string[]
  minBedrooms: number
  maxBedrooms: number
  minBudget: number
  maxBudget: number
  minSize: number
  maxSize: number
  mustHaveFeatures: string[]
  notes: string
  notifications: boolean
  notificationFrequency: "instant" | "daily" | "weekly"
}

function SearchProfileForm({
  data,
  onChange,
  togglePropertyType,
  toggleFeature,
  toggleArea,
}: {
  data: SearchProfileFormData
  onChange: (data: SearchProfileFormData) => void
  togglePropertyType: (type: string) => void
  toggleFeature: (feat: string) => void
  toggleArea: (area: string) => void
}) {
  return (
    <div className="grid gap-5 py-4">
      {/* Name & Transaction Type */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 grid gap-2">
          <Label>Search Name</Label>
          <Input
            placeholder="e.g. Family Villa in Tilal Al Ghaf"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Transaction</Label>
          <Select
            value={data.transactionType}
            onValueChange={(v: "buy" | "rent") => onChange({ ...data, transactionType: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Areas */}
      <div className="grid gap-2">
        <Label>Areas</Label>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => (
            <button
              key={area.value}
              onClick={() => toggleArea(area.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                data.areas.includes(area.value)
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Types */}
      <div className="grid gap-2">
        <Label>Property Types</Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => togglePropertyType(type)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                data.propertyTypes.includes(type)
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Min Bedrooms</Label>
          <Select
            value={data.minBedrooms.toString()}
            onValueChange={(v) => onChange({ ...data, minBedrooms: parseInt(v) })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n} BR</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Max Bedrooms</Label>
          <Select
            value={data.maxBedrooms.toString()}
            onValueChange={(v) => onChange({ ...data, maxBedrooms: parseInt(v) })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n} BR</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Min Budget (AED)</Label>
          <Input
            type="number"
            value={data.minBudget || ""}
            onChange={(e) => onChange({ ...data, minBudget: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Max Budget (AED)</Label>
          <Input
            type="number"
            value={data.maxBudget || ""}
            onChange={(e) => onChange({ ...data, maxBudget: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Min Size (sqft)</Label>
          <Input
            type="number"
            value={data.minSize || ""}
            onChange={(e) => onChange({ ...data, minSize: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Max Size (sqft)</Label>
          <Input
            type="number"
            value={data.maxSize || ""}
            onChange={(e) => onChange({ ...data, maxSize: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Must-Have Features */}
      <div className="grid gap-2">
        <Label>Must-Have Features</Label>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((feat) => (
            <button
              key={feat}
              onClick={() => toggleFeature(feat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                data.mustHaveFeatures.includes(feat)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {data.mustHaveFeatures.includes(feat) && <Check className="h-3 w-3 inline mr-1" />}
              {feat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="grid gap-2">
        <Label>Notes</Label>
        <Textarea
          placeholder="Any specific requirements, preferences, or must-haves..."
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-muted/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notif-toggle" className="font-medium">Notifications</Label>
            <p className="text-sm text-muted-foreground">Get alerts when matching properties are listed</p>
          </div>
          <Switch
            id="notif-toggle"
            checked={data.notifications}
            onCheckedChange={(v) => onChange({ ...data, notifications: v })}
          />
        </div>
        {data.notifications && (
          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Select
              value={data.notificationFrequency}
              onValueChange={(v: "instant" | "daily" | "weekly") => onChange({ ...data, notificationFrequency: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
