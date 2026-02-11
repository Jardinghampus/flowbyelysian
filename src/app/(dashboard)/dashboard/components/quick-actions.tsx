"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, FileText, Users, Calendar, MessageSquare, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RippleButton } from "@/components/ui/ripple-button"

const actions = [
  { icon: Plus, label: "Add Listing", href: "/inventory", color: "bg-green-500 hover:bg-green-600" },
  { icon: FileText, label: "New Report", href: "/performance", color: "bg-blue-500 hover:bg-blue-600" },
  { icon: Users, label: "Add Contact", href: "/users", color: "bg-purple-500 hover:bg-purple-600" },
  { icon: Calendar, label: "Schedule", href: "/calendar", color: "bg-amber-500 hover:bg-amber-600" },
  { icon: MessageSquare, label: "AI Chat", href: "/ai-assistant", color: "bg-cyan-500 hover:bg-cyan-600" },
  { icon: Target, label: "Set Goals", href: "/performance", color: "bg-rose-500 hover:bg-rose-600" },
]

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={action.href}>
              <RippleButton
                variant="ghost"
                className={`w-full h-auto flex-col gap-2 py-4 ${action.color} text-white`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </RippleButton>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
