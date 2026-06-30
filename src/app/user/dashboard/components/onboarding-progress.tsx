"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, ChevronRight, X, Sparkles, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RippleButton } from "@/components/ui/ripple-button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  description: string
  href: string
  completed: boolean
}

const STORAGE_KEY = "flow-onboarding-progress"

const defaultSteps: OnboardingStep[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your photo and contact details",
    href: "/settings/user",
    completed: false,
  },
  {
    id: "listing",
    title: "Add your first listing",
    description: "Create a stock or buyer request",
    href: "/user/marketplace",
    completed: false,
  },
  {
    id: "training",
    title: "Complete RERA training",
    description: "Review compliance requirements",
    href: "/user/market-updates",
    completed: false,
  },
  {
    id: "crm",
    title: "Connect your CRM",
    description: "Integrate with Salesforce",
    href: "/settings/connections",
    completed: false,
  },
  {
    id: "ai",
    title: "Try the AI Assistant",
    description: "Ask a question about listings",
    href: "/ai-assistant",
    completed: false,
  },
]

export function OnboardingProgress() {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.dismissed) {
            setIsVisible(false)
          }
          if (parsed.steps) {
            setSteps(defaultSteps.map(step => ({
              ...step,
              completed: parsed.steps[step.id] || false
            })))
          }
        } catch (e) {
          console.error("Failed to parse onboarding progress")
        }
      }
      setIsLoaded(true)
    }
  }, [])

  const completedCount = steps.filter(s => s.completed).length
  const progress = (completedCount / steps.length) * 100
  const allCompleted = completedCount === steps.length

  const toggleStep = (stepId: string) => {
    const newSteps = steps.map(s =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    )
    setSteps(newSteps)

    if (typeof window !== "undefined") {
      const stepsState = newSteps.reduce((acc, s) => ({
        ...acc,
        [s.id]: s.completed
      }), {})
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ steps: stepsState, dismissed: false }))
    }
  }

  const dismiss = () => {
    setIsVisible(false)
    if (typeof window !== "undefined") {
      const stepsState = steps.reduce((acc, s) => ({
        ...acc,
        [s.id]: s.completed
      }), {})
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ steps: stepsState, dismissed: true }))
    }
  }

  if (!isLoaded || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <Card className={cn(
          "relative overflow-hidden",
          allCompleted && "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
        )}>
          {/* Dismiss button */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base flex items-center gap-2">
              {allCompleted ? (
                <>
                  <Trophy className="h-4 w-4 text-green-500" />
                  Complete!
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-primary" />
                  Getting Started
                </>
              )}
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {completedCount}/{steps.length}
              </span>
            </CardTitle>
            <Progress value={progress} className="h-1.5 mt-2" />
          </CardHeader>

          <CardContent className="pt-1 pb-3">
            {allCompleted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <Link href="/user/marketplace">
                  <RippleButton size="sm" className="text-xs">
                    View Inventory
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </RippleButton>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded transition-colors",
                      step.completed ? "bg-green-500/10" : "hover:bg-muted"
                    )}
                  >
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="shrink-0"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Link href={step.href} className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-medium truncate",
                        step.completed && "line-through text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
