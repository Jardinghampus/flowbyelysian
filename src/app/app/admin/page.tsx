"use client"

import { useState, useEffect, useCallback } from "react"
import { useRole } from "@/contexts/role-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Shield, User, Search, TrendingUp, Users, Loader2, Mail, Building2, MapPin, Eye, Tag, Bed, Bath, Maximize2, Newspaper, FileText, Layers, Settings2, ClipboardList, Calendar, Star, ChevronDown, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AgentPerformanceEditor } from "./components/agent-performance-editor"
import { MarketUpdatesCms } from "./components/market-updates-cms"
import { AgentOverviewPanel } from "./components/agent-overview-panel"
import { AreaManagement } from "./components/area-management"
import { CsvImportOwners } from "./components/csv-import-owners"
import { DatabaseSetup } from "./components/database-setup"
import { toast } from "sonner"

interface AgencyListing {
  id: string
  title: string
  area: string
  propertyType: string
  transactionType: "sale" | "rent"
  status: "live" | "pocket" | "draft"
  price: number
  bedrooms: number
  bathrooms: number
  size: number
  agent: string
  views: number
  inquiries: number
  createdAt: string
}

const demoAgencyListings: AgencyListing[] = [
  { id: "al-1", title: "5BR Villa — Emirates Hills", area: "Emirates Hills", propertyType: "Villa", transactionType: "sale", status: "live", price: 15000000, bedrooms: 5, bathrooms: 6, size: 8500, agent: "Ahmed Hassan", views: 342, inquiries: 8, createdAt: "2026-01-15" },
  { id: "al-2", title: "4BR Townhouse — Arabian Ranches III", area: "Arabian Ranches", propertyType: "Townhouse", transactionType: "sale", status: "live", price: 5200000, bedrooms: 4, bathrooms: 4, size: 3800, agent: "Sara Al-Mahmoud", views: 187, inquiries: 4, createdAt: "2026-02-10" },
  { id: "al-3", title: "2BR Apartment — Marina View", area: "Dubai Marina", propertyType: "Apartment", transactionType: "rent", status: "pocket", price: 130000, bedrooms: 2, bathrooms: 2, size: 1400, agent: "Ahmed Hassan", views: 56, inquiries: 1, createdAt: "2026-02-20" },
  { id: "al-4", title: "3BR Penthouse — DIFC", area: "DIFC", propertyType: "Penthouse", transactionType: "sale", status: "live", price: 8500000, bedrooms: 3, bathrooms: 4, size: 4200, agent: "Omar Khalil", views: 220, inquiries: 6, createdAt: "2026-01-28" },
  { id: "al-5", title: "Studio — Business Bay", area: "Business Bay", propertyType: "Apartment", transactionType: "rent", status: "draft", price: 55000, bedrooms: 0, bathrooms: 1, size: 450, agent: "Sara Al-Mahmoud", views: 0, inquiries: 0, createdAt: "2026-03-01" },
  { id: "al-6", title: "6BR Mansion — Palm Jumeirah", area: "Palm Jumeirah", propertyType: "Villa", transactionType: "sale", status: "live", price: 45000000, bedrooms: 6, bathrooms: 8, size: 15000, agent: "Omar Khalil", views: 510, inquiries: 12, createdAt: "2026-01-05" },
  { id: "al-7", title: "1BR Apartment — Downtown", area: "Downtown Dubai", propertyType: "Apartment", transactionType: "rent", status: "live", price: 95000, bedrooms: 1, bathrooms: 1, size: 850, agent: "Ahmed Hassan", views: 130, inquiries: 3, createdAt: "2026-02-15" },
]

const listingStatusColors: Record<string, { bg: string; text: string }> = {
  live: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  pocket: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  draft: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-600 dark:text-neutral-400" },
}

type UserRole = "admin" | "agent"

interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  area: string | null
  createdAt: number
  lastActiveAt: number | null
  imageUrl: string | null
}

export default function AdminPage() {
  const { isAdmin } = useRole()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "agent" as UserRole,
    area: "",
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        if (res.status === 403) {
          router.push("/app/dashboard")
          return
        }
        throw new Error("Failed to fetch users")
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, fetchUsers])

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin && !loading) {
      router.push("/app/dashboard")
    }
  }, [isAdmin, router, loading])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleInviteUser = async () => {
    if (!newUser.email) {
      toast.error("Email is required")
      return
    }
    if (!newUser.password || newUser.password.length < 4) {
      toast.error("Password is required (min 8 characters)")
      return
    }

    setIsInviting(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          password: newUser.password,
          role: newUser.role,
          area: newUser.area || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create user")
      }

      toast.success("User created successfully")
      setNewUser({ email: "", firstName: "", lastName: "", password: "", role: "agent", area: "" })
      setIsAddDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete user")
      }

      toast.success("User deleted successfully")
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) {
        throw new Error("Failed to update role")
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
      toast.success("Role updated successfully")
    } catch (error) {
      console.error("Error updating role:", error)
      toast.error("Failed to update role")
    }
  }

  const adminCount = users.filter((u) => u.role === "admin").length
  const agentCount = users.filter((u) => u.role === "agent").length

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never"
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <>
      {/* Page Title */}
      <div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and agent performance
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Agency Listings
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Agent Performance
            </TabsTrigger>
            <TabsTrigger value="market-updates" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Market Updates
            </TabsTrigger>
            <TabsTrigger value="agent-overview" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Agent Overview
            </TabsTrigger>
            <TabsTrigger value="areas" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Areas & Access
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* Document Management Quick Links */}
          <div className="flex gap-3 mb-6">
            <Link href="/app/admin/documents">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                All Documents
              </Button>
            </Link>
            <Link href="/app/admin/templates">
              <Button variant="outline" size="sm" className="gap-2">
                <Layers className="h-4 w-4" />
                Document Templates
              </Button>
            </Link>
            <Link href="/app/admin/document-settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Document Header
              </Button>
            </Link>
          </div>

          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admins</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agents</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agentCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      View and manage all users in the system
                    </CardDescription>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create an agent or admin account with email and password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) =>
                              setNewUser({ ...newUser, email: e.target.value })
                            }
                            placeholder="agent@zaylo.ae"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) =>
                              setNewUser({ ...newUser, password: e.target.value })
                            }
                            placeholder="Min 8 characters"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={newUser.firstName}
                              onChange={(e) =>
                                setNewUser({ ...newUser, firstName: e.target.value })
                              }
                              placeholder="John"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={newUser.lastName}
                              onChange={(e) =>
                                setNewUser({ ...newUser, lastName: e.target.value })
                              }
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value: UserRole) =>
                              setNewUser({ ...newUser, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="area">Assigned Area</Label>
                          <Select
                            value={newUser.area}
                            onValueChange={(value) =>
                              setNewUser({ ...newUser, area: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an area" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tilal-al-ghaf">Tilal Al Ghaf</SelectItem>
                              <SelectItem value="palm-jumeirah">Palm Jumeirah</SelectItem>
                              <SelectItem value="dubai-marina">Dubai Marina</SelectItem>
                              <SelectItem value="downtown-dubai">Downtown Dubai</SelectItem>
                              <SelectItem value="arabian-ranches">Arabian Ranches</SelectItem>
                              <SelectItem value="emirates-hills">Emirates Hills</SelectItem>
                              <SelectItem value="business-bay">Business Bay</SelectItem>
                              <SelectItem value="jbr">JBR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteUser} disabled={isInviting}>
                          {isInviting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Create User
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={(value: "all" | UserRole) => setRoleFilter(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-muted-foreground">No users found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(value: UserRole) =>
                                  handleRoleChange(user.id, value)
                                }
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue>
                                    <Badge
                                      variant={user.role === "admin" ? "default" : "secondary"}
                                    >
                                      {user.role === "admin" ? (
                                        <Shield className="mr-1 h-3 w-3" />
                                      ) : (
                                        <User className="mr-1 h-3 w-3" />
                                      )}
                                      {user.role}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="agent">Agent</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {user.area ? (
                                <Badge variant="outline">{user.area}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{formatDate(user.lastActiveAt)}</TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name}? This
                                      action cannot be undone and will remove all their data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            {/* Listing Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoAgencyListings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live</CardTitle>
                  <Eye className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{demoAgencyListings.filter(l => l.status === "live").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pocket</CardTitle>
                  <Tag className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{demoAgencyListings.filter(l => l.status === "pocket").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{demoAgencyListings.reduce((sum, l) => sum + l.views, 0).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Listings Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Agency Listings</CardTitle>
                <CardDescription>Overview of all property listings across the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Inquiries</TableHead>
                        <TableHead>Listed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoAgencyListings.map((listing) => {
                        const sc = listingStatusColors[listing.status]
                        return (
                          <TableRow key={listing.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{listing.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {listing.area}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p>{listing.propertyType}</p>
                                <p className="text-muted-foreground flex items-center gap-2">
                                  {listing.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{listing.bedrooms}</span>}
                                  <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />{listing.size.toLocaleString()}</span>
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${sc.bg} ${sc.text} border-0`}>
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              AED {listing.price >= 1000000 ? `${(listing.price / 1000000).toFixed(1)}M` : listing.price.toLocaleString()}
                              {listing.transactionType === "rent" ? "/yr" : ""}
                            </TableCell>
                            <TableCell className="text-sm">{listing.agent}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.views}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.inquiries}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{listing.createdAt}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <AgentPerformanceEditor />
          </TabsContent>

          <TabsContent value="market-updates">
            <MarketUpdatesCms />
          </TabsContent>

          <TabsContent value="agent-overview" className="space-y-6">
            <AgentOverviewPanel />
          </TabsContent>

          <TabsContent value="areas" className="space-y-6">
            <AreaManagement />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <DatabaseSetup />
            <CsvImportOwners />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
