"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Phone, Building2, FileText, X, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RippleButton } from "@/components/ui/ripple-button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  name: string
  area: string
  avatar?: string
  initials: string
  isOnline: boolean
  joinedAgo: string
  whatsapp: string
  inventory: number
  requests: number
  role: "Sales" | "Leasing"
}

const agents: Agent[] = [
  {
    id: "1",
    name: "Hampus Jarding",
    area: "Al Furjan",
    initials: "HJ",
    isOnline: true,
    joinedAgo: "2 days",
    whatsapp: "+971501234567",
    inventory: 65,
    requests: 12,
    role: "Leasing",
  },
  {
    id: "2",
    name: "Alex Scriven",
    area: "The Palm",
    initials: "AS",
    isOnline: true,
    joinedAgo: "5 days",
    whatsapp: "+971502345678",
    inventory: 23,
    requests: 8,
    role: "Sales",
  },
  {
    id: "3",
    name: "Madelon",
    area: "Tilal Al Ghaf",
    initials: "MD",
    isOnline: false,
    joinedAgo: "1 week",
    whatsapp: "+971503456789",
    inventory: 100,
    requests: 15,
    role: "Sales",
  },
  {
    id: "4",
    name: "Paola Santos",
    area: "Tilal Al Ghaf",
    initials: "PS",
    isOnline: true,
    joinedAgo: "2 weeks",
    whatsapp: "+971504567890",
    inventory: 54,
    requests: 6,
    role: "Leasing",
  },
  {
    id: "5",
    name: "Sarah Miller",
    area: "Downtown Dubai",
    initials: "SM",
    isOnline: false,
    joinedAgo: "3 weeks",
    whatsapp: "+971505678901",
    inventory: 42,
    requests: 9,
    role: "Sales",
  },
  {
    id: "6",
    name: "Omar Khan",
    area: "Dubai Marina",
    initials: "OK",
    isOnline: true,
    joinedAgo: "1 month",
    whatsapp: "+971506789012",
    inventory: 38,
    requests: 11,
    role: "Sales",
  },
]

function AgentRow({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left"
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="bg-primary/10 text-sm font-medium">
            {agent.initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            agent.isOnline ? "bg-green-500" : "bg-gray-300"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{agent.name}</p>
        <p className="text-xs text-muted-foreground truncate">{agent.area}</p>
      </div>
      <RippleButton variant="outline" size="sm" className="text-xs h-7 px-3">
        Contact
      </RippleButton>
    </motion.button>
  )
}

function AgentCard({ agent, open, onClose }: { agent: Agent | null; open: boolean; onClose: () => void }) {
  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Agent Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center pt-4">
          <div className="relative mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold">
                {agent.initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background",
                agent.isOnline ? "bg-green-500" : "bg-gray-300"
              )}
            />
          </div>

          <h3 className="text-xl font-semibold">{agent.name}</h3>
          <p className="text-muted-foreground">{agent.area}</p>
          <Badge variant="outline" className="mt-2">
            {agent.role}
          </Badge>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <Building2 className="h-5 w-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{agent.inventory}</p>
              <p className="text-xs text-muted-foreground">Inventory</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <FileText className="h-5 w-5 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{agent.requests}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full mt-6">
            <a href={`https://wa.me/${agent.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <RippleButton className="w-full bg-green-500 hover:bg-green-600 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </RippleButton>
            </a>
            <a href={`tel:${agent.whatsapp}`} className="flex-1">
              <RippleButton variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </RippleButton>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TeamSidebar() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const newAgents = agents.filter(a => a.joinedAgo.includes("day") || a.joinedAgo.includes("week"))
  const onlineAgents = agents.filter(a => a.isOnline)

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setDialogOpen(true)
  }

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Team</CardTitle>
            <Link href="/users">
              <RippleButton variant="outline" size="sm" className="text-xs">
                See All
              </RippleButton>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Team Members */}
          {newAgents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">New Members</p>
              <div className="space-y-1">
                {newAgents.slice(0, 3).map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AgentRow agent={agent} onClick={() => handleAgentClick(agent)} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Online Now */}
          {onlineAgents.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Online Now</p>
              <div className="space-y-1">
                {onlineAgents.slice(0, 4).map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AgentRow agent={agent} onClick={() => handleAgentClick(agent)} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AgentCard
        agent={selectedAgent}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
