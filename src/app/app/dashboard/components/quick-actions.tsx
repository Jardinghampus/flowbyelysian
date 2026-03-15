"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, FileText, Users, Calendar, MessageSquare, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RippleButton } from "@/components/ui/ripple-button"

const actions = [
  { icon: Plus, label: "Add Listing", href: "/app/inventory", color: "bg-green-500 hover:bg-green-600" },
  { icon: FileText, label: "Report", href: "/app/performance", color: "bg-blue-500 hover:bg-blue-600" },
  { icon: Users, label: "Contact", href: "/app/users", color: "bg-purple-500 hover:bg-purple-600" },
  { icon: Calendar, label: "Schedule", href: "/app/calendar", color: "bg-amber-500 hover:bg-amber-600" },
  { icon: MessageSquare, label: "AI Chat", href: "/ai-assistant", color: "bg-cyan-500 hover:bg-cyan-600" },
  { icon: Target, label: "Goals", href: "/app/performance", color: "bg-rose-500 hover:bg-rose-600" },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-1.5 pb-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <Link href={action.href}>
              <RippleButton
                variant="ghost"
                className={`w-full h-auto flex-col gap-1 py-2.5 px-1 ${action.color} text-white rounded-lg`}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{action.label}</span>
              </RippleButton>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
