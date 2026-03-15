"use client"

import { Users, Phone, Mail, Building2, DollarSign, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AreaAgent } from "../../data/areas-data"
import { formatPrice } from "../../data/areas-data"

interface AreaAgentsProps {
  agents: AreaAgent[]
}

export function AreaAgents({ agents }: AreaAgentsProps) {
  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No agents assigned to this area yet.</p>
        </CardContent>
      </Card>
    )
  }

  // Sort agents by commission (top performer first)
  const sortedAgents = [...agents].sort((a, b) => b.commission - a.commission)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedAgents.map((agent, index) => (
        <Card key={agent.id} className="relative overflow-hidden">
          {index === 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Trophy className="h-3 w-3 mr-1" />
                Top Performer
              </Badge>
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={agent.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {agent.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {agent.role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{agent.deals}</p>
                <p className="text-xs text-muted-foreground">Deals</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{agent.listings}</p>
                <p className="text-xs text-muted-foreground">Listings</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(agent.commission).replace("AED ", "")}
                </p>
                <p className="text-xs text-muted-foreground">Commission</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{agent.email}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
