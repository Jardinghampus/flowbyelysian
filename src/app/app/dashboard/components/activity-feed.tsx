"use client"

import { motion } from "framer-motion"
import { Clock, CheckCircle2, Phone, Mail, Calendar, TrendingUp } from "lucide-react"
import { CardContent } from "@/components/ui/card"
import { CollapsibleCard } from "@/components/ui/collapsible-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "deal" | "call" | "email" | "meeting" | "milestone"
  title: string
  description: string
  time: string
  user: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "deal",
    title: "New deal closed",
    description: "Palm Jumeirah Villa - AED 12.5M",
    time: "2 min ago",
    user: "AH",
  },
  {
    id: "2",
    type: "call",
    title: "Client follow-up",
    description: "Mr. Ahmed - Dubai Marina inquiry",
    time: "15 min ago",
    user: "SM",
  },
  {
    id: "3",
    type: "meeting",
    title: "Viewing scheduled",
    description: "Emirates Hills - 4BR Villa",
    time: "1 hour ago",
    user: "JD",
  },
  {
    id: "4",
    type: "milestone",
    title: "Target achieved",
    description: "Monthly sales target 120%",
    time: "2 hours ago",
    user: "Team",
  },
]

const activityIcons = {
  deal: CheckCircle2,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  milestone: TrendingUp,
}

const activityColors = {
  deal: "text-green-500 bg-green-500/10",
  call: "text-blue-500 bg-blue-500/10",
  email: "text-purple-500 bg-purple-500/10",
  meeting: "text-amber-500 bg-amber-500/10",
  milestone: "text-cyan-500 bg-cyan-500/10",
}

export function ActivityFeed() {
  return (
    <CollapsibleCard
      title="Recent Activity"
      icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      defaultOpen={true}
      storageKey="activity-feed"
    >
      <CardContent className="space-y-3 pb-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type]
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={cn("p-2 rounded-lg", activityColors[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-primary/10">{activity.user}</AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </CollapsibleCard>
  )
}
