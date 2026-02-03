"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Save, Edit2, X, Check, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"

type Agent = {
  id: number
  name: string
  contacts: number
  listings: number
  viewings: number
  commission: number
  deals: number
  targetPercent: number
  points: number
  rank: number
  area: string
  role: "Sales" | "Leasing"
  target: number
}

// Initial data - in production this would come from a database
const INITIAL_AGENTS: Agent[] = [
  {
    id: 1,
    name: "Hampus Jarding",
    contacts: 4,
    listings: 65,
    viewings: 54,
    commission: 40000,
    deals: 7,
    targetPercent: 100,
    points: 493,
    rank: 4,
    area: "Al Furjan",
    role: "Leasing",
    target: 40000,
  },
  {
    id: 2,
    name: "Paola Santos",
    contacts: 6,
    listings: 54,
    viewings: 32,
    commission: 32000,
    deals: 10,
    targetPercent: 80,
    points: 693,
    rank: 3,
    area: "Tilal Al Ghaf",
    role: "Leasing",
    target: 40000,
  },
  {
    id: 3,
    name: "Madelon",
    contacts: 10,
    listings: 100,
    viewings: 78,
    commission: 65000,
    deals: 12,
    targetPercent: 87,
    points: 894,
    rank: 2,
    area: "Tilal Al Ghaf",
    role: "Sales",
    target: 75000,
  },
  {
    id: 4,
    name: "Alex Scriven",
    contacts: 23,
    listings: 23,
    viewings: 43,
    commission: 95000,
    deals: 5,
    targetPercent: 127,
    points: 912,
    rank: 1,
    area: "The Palm",
    role: "Sales",
    target: 75000,
  },
  {
    id: 5,
    name: "Jane Doe",
    contacts: 23,
    listings: 43,
    viewings: 53,
    commission: 2000,
    deals: 3,
    targetPercent: 44,
    points: 430,
    rank: 6,
    area: "The Marina",
    role: "Sales",
    target: 4500,
  },
]

const AREAS = [
  "Al Furjan",
  "Tilal Al Ghaf",
  "The Palm",
  "The Marina",
  "Downtown Dubai",
  "Dubai Hills",
  "JBR",
  "Business Bay",
]

export function AgentPerformanceEditor() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: "",
    contacts: 0,
    listings: 0,
    viewings: 0,
    commission: 0,
    deals: 0,
    targetPercent: 0,
    points: 0,
    rank: agents.length + 1,
    area: "Al Furjan",
    role: "Sales",
    target: 40000,
  })

  const startEditing = (agent: Agent) => {
    setEditingId(agent.id)
    setEditedAgent({ ...agent })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditedAgent(null)
  }

  const saveEditing = () => {
    if (!editedAgent) return

    setAgents(agents.map((a) => (a.id === editedAgent.id ? editedAgent : a)))
    setEditingId(null)
    setEditedAgent(null)

    toast.success("Agent Updated", {
      description: `${editedAgent.name}'s data has been saved.`,
    })
  }

  const handleAddAgent = () => {
    if (!newAgent.name) {
      toast.error("Error", {
        description: "Please enter an agent name.",
      })
      return
    }

    const agent: Agent = {
      id: Date.now(),
      name: newAgent.name || "",
      contacts: newAgent.contacts || 0,
      listings: newAgent.listings || 0,
      viewings: newAgent.viewings || 0,
      commission: newAgent.commission || 0,
      deals: newAgent.deals || 0,
      targetPercent: newAgent.targetPercent || 0,
      points: newAgent.points || 0,
      rank: agents.length + 1,
      area: newAgent.area || "Al Furjan",
      role: newAgent.role || "Sales",
      target: newAgent.target || 40000,
    }

    setAgents([...agents, agent])
    setNewAgent({
      name: "",
      contacts: 0,
      listings: 0,
      viewings: 0,
      commission: 0,
      deals: 0,
      targetPercent: 0,
      points: 0,
      rank: agents.length + 2,
      area: "Al Furjan",
      role: "Sales",
      target: 40000,
    })
    setIsAddDialogOpen(false)

    toast.success("Agent Added", {
      description: `${agent.name} has been added to the system.`,
    })
  }

  const handleDeleteAgent = (id: number) => {
    const agent = agents.find((a) => a.id === id)
    setAgents(agents.filter((a) => a.id !== id))

    toast.success("Agent Deleted", {
      description: `${agent?.name} has been removed from the system.`,
    })
  }

  const updateEditedField = (field: keyof Agent, value: string | number) => {
    if (!editedAgent) return
    setEditedAgent({ ...editedAgent, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Agent Performance Data</CardTitle>
            <CardDescription>
              Edit agent metrics, targets, and performance data
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>
                  Add a new agent to track their performance metrics.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-name">Name</Label>
                    <Input
                      id="new-name"
                      value={newAgent.name}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, name: e.target.value })
                      }
                      placeholder="Agent Name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-area">Area</Label>
                    <Select
                      value={newAgent.area}
                      onValueChange={(value) =>
                        setNewAgent({ ...newAgent, area: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-role">Role</Label>
                    <Select
                      value={newAgent.role}
                      onValueChange={(value: "Sales" | "Leasing") =>
                        setNewAgent({ ...newAgent, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Leasing">Leasing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-target">Target (AED)</Label>
                    <Input
                      id="new-target"
                      type="number"
                      value={newAgent.target}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, target: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-contacts">Contacts</Label>
                    <Input
                      id="new-contacts"
                      type="number"
                      value={newAgent.contacts}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, contacts: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-listings">Listings</Label>
                    <Input
                      id="new-listings"
                      type="number"
                      value={newAgent.listings}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, listings: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-viewings">Viewings</Label>
                    <Input
                      id="new-viewings"
                      type="number"
                      value={newAgent.viewings}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, viewings: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-deals">Deals</Label>
                    <Input
                      id="new-deals"
                      type="number"
                      value={newAgent.deals}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, deals: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-commission">Commission</Label>
                    <Input
                      id="new-commission"
                      type="number"
                      value={newAgent.commission}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, commission: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-points">Points</Label>
                    <Input
                      id="new-points"
                      type="number"
                      value={newAgent.points}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, points: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-targetPercent">Target %</Label>
                    <Input
                      id="new-targetPercent"
                      type="number"
                      value={newAgent.targetPercent}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, targetPercent: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAgent}>Add Agent</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="text-right">Listings</TableHead>
                <TableHead className="text-right">Viewings</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Target %</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  {editingId === agent.id && editedAgent ? (
                    <>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.rank}
                          onChange={(e) => updateEditedField("rank", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={editedAgent.name}
                          onChange={(e) => updateEditedField("name", e.target.value)}
                          className="w-32 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editedAgent.area}
                          onValueChange={(value) => updateEditedField("area", value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AREAS.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={editedAgent.role}
                          onValueChange={(value: "Sales" | "Leasing") =>
                            updateEditedField("role", value)
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Leasing">Leasing</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.contacts}
                          onChange={(e) => updateEditedField("contacts", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.listings}
                          onChange={(e) => updateEditedField("listings", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.viewings}
                          onChange={(e) => updateEditedField("viewings", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.deals}
                          onChange={(e) => updateEditedField("deals", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.commission}
                          onChange={(e) => updateEditedField("commission", Number(e.target.value))}
                          className="w-24 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.targetPercent}
                          onChange={(e) => updateEditedField("targetPercent", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editedAgent.points}
                          onChange={(e) => updateEditedField("points", Number(e.target.value))}
                          className="w-16 h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={saveEditing}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">#{agent.rank}</TableCell>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.area}</TableCell>
                      <TableCell>
                        <Badge variant={agent.role === "Sales" ? "default" : "secondary"}>
                          {agent.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{agent.contacts}</TableCell>
                      <TableCell className="text-right">{agent.listings}</TableCell>
                      <TableCell className="text-right">{agent.viewings}</TableCell>
                      <TableCell className="text-right font-medium">{agent.deals}</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {agent.commission.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            agent.targetPercent >= 100
                              ? "default"
                              : agent.targetPercent >= 75
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {agent.targetPercent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{agent.points}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(agent)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {agent.name}? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAgent(agent.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{agent.rank}</span>
                      <span className="font-semibold">{agent.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{agent.area}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(agent)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {agent.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="bg-destructive"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Deals</div>
                    <div className="font-bold">{agent.deals}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Target</div>
                    <Badge
                      variant={
                        agent.targetPercent >= 100
                          ? "default"
                          : agent.targetPercent >= 75
                          ? "secondary"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {agent.targetPercent}%
                    </Badge>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Points</div>
                    <div className="font-bold">{agent.points}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <Badge variant={agent.role === "Sales" ? "default" : "secondary"}>
                    {agent.role}
                  </Badge>
                  <span className="font-bold">AED {agent.commission.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
