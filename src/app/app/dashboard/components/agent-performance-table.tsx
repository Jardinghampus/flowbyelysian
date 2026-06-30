"use client"

import * as React from "react"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Trophy,
  Medal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CardContent } from "@/components/ui/card"
import { CollapsibleCard } from "@/components/ui/collapsible-card"
import { cn } from "@/lib/utils"

import agentData from "../data/agent-performance.json"

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
  role: string
  target: number
}

type SortField = "name" | "commission" | "deals" | "targetPercent" | "points" | "rank"
type SortDirection = "asc" | "desc"

export function AgentPerformanceTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [areaFilter, setAreaFilter] = React.useState<string>("all")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [sortField, setSortField] = React.useState<SortField>("rank")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")

  const agents: Agent[] = agentData.agents

  // Get unique areas and roles for filters
  const areas = React.useMemo(() => {
    const uniqueAreas = [...new Set(agents.map(a => a.area))]
    return uniqueAreas.sort()
  }, [agents])

  const roles = React.useMemo(() => {
    const uniqueRoles = [...new Set(agents.map(a => a.role))]
    return uniqueRoles.sort()
  }, [agents])

  // Filter and sort agents
  const filteredAgents = React.useMemo(() => {
    let result = [...agents]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.area.toLowerCase().includes(query)
      )
    }

    // Area filter
    if (areaFilter !== "all") {
      result = result.filter(agent => agent.area === areaFilter)
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter(agent => agent.role === roleFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "commission":
          comparison = a.commission - b.commission
          break
        case "deals":
          comparison = a.deals - b.deals
          break
        case "targetPercent":
          comparison = a.targetPercent - b.targetPercent
          break
        case "points":
          comparison = a.points - b.points
          break
        case "rank":
          comparison = a.rank - b.rank
          break
        default:
          comparison = 0
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [agents, searchQuery, areaFilter, roleFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    return sortDirection === "asc"
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return null
  }

  const getTargetBadgeVariant = (percent: number) => {
    if (percent >= 100) return "default"
    if (percent >= 75) return "secondary"
    return "destructive"
  }

  return (
    <CollapsibleCard
      title="Agent Performance"
      icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
      defaultOpen={false}
      storageKey="agent-performance"
    >
      <CardContent className="pt-0">
        {/* Filters - Mobile Responsive */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortField}-${sortDirection}`}
              onValueChange={(value) => {
                const [field, dir] = value.split("-") as [SortField, SortDirection]
                setSortField(field)
                setSortDirection(dir)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank-asc">Rank (Best First)</SelectItem>
                <SelectItem value="rank-desc">Rank (Last First)</SelectItem>
                <SelectItem value="commission-desc">Commission (High-Low)</SelectItem>
                <SelectItem value="commission-asc">Commission (Low-High)</SelectItem>
                <SelectItem value="points-desc">Points (High-Low)</SelectItem>
                <SelectItem value="points-asc">Points (Low-High)</SelectItem>
                <SelectItem value="targetPercent-desc">Target % (High-Low)</SelectItem>
                <SelectItem value="targetPercent-asc">Target % (Low-High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="p-0 h-auto font-medium hover:bg-transparent"
                  >
                    Name
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Contacts</TableHead>
                <TableHead className="text-right">Listings</TableHead>
                <TableHead className="text-right">Viewings</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("deals")}
                    className="p-0 h-auto font-medium hover:bg-transparent"
                  >
                    Deals
                    <SortIcon field="deals" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("commission")}
                    className="p-0 h-auto font-medium hover:bg-transparent"
                  >
                    Commission
                    <SortIcon field="commission" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("targetPercent")}
                    className="p-0 h-auto font-medium hover:bg-transparent"
                  >
                    Target %
                    <SortIcon field="targetPercent" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("points")}
                    className="p-0 h-auto font-medium hover:bg-transparent"
                  >
                    Points
                    <SortIcon field="points" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(agent.rank)}
                      <span className="font-medium">#{agent.rank}</span>
                    </div>
                  </TableCell>
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
                    <Badge variant={getTargetBadgeVariant(agent.targetPercent)}>
                      {agent.targetPercent}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{agent.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankIcon(agent.rank)}
                  <span className="font-bold text-lg">#{agent.rank}</span>
                  <span className="font-semibold">{agent.name}</span>
                </div>
                <Badge variant={agent.role === "Sales" ? "default" : "secondary"}>
                  {agent.role}
                </Badge>
              </div>

              {/* Area */}
              <div className="text-sm text-muted-foreground">{agent.area}</div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Deals</div>
                  <div className="font-bold">{agent.deals}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Target</div>
                  <Badge variant={getTargetBadgeVariant(agent.targetPercent)} className="mt-1">
                    {agent.targetPercent}%
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs text-muted-foreground">Points</div>
                  <div className="font-bold">{agent.points}</div>
                </div>
              </div>

              {/* Commission */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Commission</span>
                <span className="font-bold text-lg">AED {agent.commission.toLocaleString()}</span>
              </div>

              {/* Activity Row */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{agent.contacts} contacts</span>
                <span>{agent.listings} listings</span>
                <span>{agent.viewings} viewings</span>
              </div>
            </div>
          ))}

          {filteredAgents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No agents found matching your filters.
            </div>
          )}
        </div>
      </CardContent>
    </CollapsibleCard>
  )
}
