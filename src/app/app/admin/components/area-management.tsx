"use client"

import { useState, useEffect, useCallback } from "react"
import {
  MapPin, Plus, Trash2, Users, Building2, Loader2, Search, Shield, X, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Area {
  id: string
  slug: string
  name: string
  description: string | null
  image: string | null
  stats: {
    totalListings: number
    activeAgents: number
    avgPrice: number
    totalDeals: number
    avgRentYield: number
  }
}

interface Assignment {
  id: string
  agent_id: string
  area_id: string
  is_primary: boolean
  areas?: { id: string; name: string; slug: string }
}

interface Agent {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  area: string | null
  role: string
}

export function AreaManagement() {
  const [areas, setAreas] = useState<Area[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Add area dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addName, setAddName] = useState("")
  const [addDescription, setAddDescription] = useState("")
  const [addSaving, setAddSaving] = useState(false)

  // Delete area
  const [deleteArea, setDeleteArea] = useState<Area | null>(null)

  // Assign agents dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignArea, setAssignArea] = useState<Area | null>(null)
  const [selectedAgent, setSelectedAgent] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [areasRes, agentsRes, assignRes] = await Promise.all([
        fetch("/api/areas"),
        fetch("/api/admin/users"),
        fetch("/api/areas/assignments"),
      ])

      if (areasRes.ok) {
        const data = await areasRes.json()
        setAreas(data.areas || [])
      }
      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setAgents((data.users || []).filter((u: Agent) => u.role === "agent" || u.role === "admin"))
      }
      if (assignRes.ok) {
        const data = await assignRes.json()
        setAssignments(data.assignments || [])
      }
    } catch (e) {
      console.error("Error loading data:", e)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAddArea = async () => {
    if (!addName.trim()) { toast.error("Name is required"); return }

    setAddSaving(true)
    try {
      const slug = addName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), slug, description: addDescription || null }),
      })
      if (!res.ok) throw new Error("Failed to add area")
      toast.success(`Area "${addName}" added`)
      setAddName(""); setAddDescription(""); setAddOpen(false)
      fetchData()
    } catch {
      toast.error("Failed to add area")
    } finally {
      setAddSaving(false)
    }
  }

  const handleDeleteArea = async () => {
    if (!deleteArea) return
    try {
      const res = await fetch(`/api/areas/${deleteArea.slug}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success(`Area "${deleteArea.name}" deleted`)
      setDeleteArea(null)
      fetchData()
    } catch {
      toast.error("Failed to delete area")
    }
  }

  const handleAssignAgent = async () => {
    if (!selectedAgent || !assignArea) return
    try {
      const res = await fetch("/api/areas/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: selectedAgent, area_id: assignArea.id }),
      })
      if (!res.ok) throw new Error("Failed to assign")
      toast.success("Agent assigned to area")
      setSelectedAgent("")
      fetchData()
    } catch {
      toast.error("Failed to assign agent")
    }
  }

  const handleRemoveAssignment = async (agentId: string, areaId: string) => {
    try {
      const res = await fetch(`/api/areas/assignments?agentId=${agentId}&areaId=${areaId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to remove")
      toast.success("Agent removed from area")
      fetchData()
    } catch {
      toast.error("Failed to remove assignment")
    }
  }

  const getAreaAgents = (areaId: string) => {
    return assignments
      .filter((a) => a.area_id === areaId)
      .map((a) => {
        const agent = agents.find((ag) => ag.id === a.agent_id)
        return { ...a, agent }
      })
  }

  const getUnassignedAgents = (areaId: string) => {
    const assignedIds = assignments.filter((a) => a.area_id === areaId).map((a) => a.agent_id)
    return agents.filter((a) => !assignedIds.includes(a.id))
  }

  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{areas.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{areas.filter((a) => getAreaAgents(a.id).length === 0).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search areas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Area
        </Button>
      </div>

      {/* Areas table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Area</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-center">Listings</TableHead>
              <TableHead className="w-[280px]">Agents with Access</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {search ? "No areas match your search" : "No areas yet — add your first area"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAreas.map((area) => {
                const areaAgents = getAreaAgents(area.id)
                return (
                  <TableRow key={area.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{area.name}</p>
                          <p className="text-xs text-muted-foreground">{area.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {area.description || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {area.stats.totalListings}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {areaAgents.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No agents assigned</span>
                        ) : (
                          areaAgents.map((aa) => (
                            <Badge
                              key={aa.id}
                              variant="outline"
                              className="gap-1 pr-1 text-xs"
                            >
                              <Shield className="h-3 w-3" />
                              {aa.agent?.fullName || aa.agent_id}
                              <button
                                onClick={() => handleRemoveAssignment(aa.agent_id, aa.area_id)}
                                className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => { setAssignArea(area); setAssignOpen(true) }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteArea(area)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Area Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add New Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Area Name *</Label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Mudon"
                className="mt-1"
              />
              {addName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Slug: {addName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="mt-1 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddArea} disabled={addSaving}>
              {addSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Confirmation */}
      <AlertDialog open={!!deleteArea} onOpenChange={(v) => !v && setDeleteArea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteArea?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the area and all agent assignments. Listings in this area will not be deleted but will lose their area reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArea} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Agent Dialog */}
      <Dialog open={assignOpen} onOpenChange={(v) => { setAssignOpen(v); if (!v) { setAssignArea(null); setSelectedAgent("") } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Assign Agent to {assignArea?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {assignArea && getUnassignedAgents(assignArea.id).length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">All agents are already assigned</div>
                  ) : (
                    assignArea && getUnassignedAgents(assignArea.id).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.fullName || `${agent.firstName} ${agent.lastName}`} ({agent.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Already assigned agents */}
            {assignArea && getAreaAgents(assignArea.id).length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Currently Assigned</Label>
                <div className="space-y-1.5">
                  {getAreaAgents(assignArea.id).map((aa) => (
                    <div key={aa.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-sm">{aa.agent?.fullName || aa.agent_id}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(aa.agent_id, aa.area_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Done</Button>
            <Button onClick={handleAssignAgent} disabled={!selectedAgent}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
