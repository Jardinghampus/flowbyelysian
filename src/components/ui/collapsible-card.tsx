"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

interface CollapsibleCardProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
  storageKey?: string
}

export function CollapsibleCard({
  title,
  icon,
  defaultOpen = true,
  children,
  className,
  headerAction,
  storageKey,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = React.useState(() => {
    if (typeof window === "undefined" || !storageKey) return defaultOpen
    const stored = localStorage.getItem(`collapsible-${storageKey}`)
    return stored !== null ? stored === "true" : defaultOpen
  })

  const toggleOpen = () => {
    const next = !isOpen
    setIsOpen(next)
    if (storageKey && typeof window !== "undefined") {
      localStorage.setItem(`collapsible-${storageKey}`, String(next))
    }
  }

  return (
    <Card className={cn("overflow-hidden gap-0", className)}>
      <button
        onClick={toggleOpen}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-t-2xl"
      >
        <CardHeader className="pb-2 pt-3.5 cursor-pointer select-none">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {headerAction && (
                <div onClick={(e) => e.stopPropagation()}>
                  {headerAction}
                </div>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </CardHeader>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
