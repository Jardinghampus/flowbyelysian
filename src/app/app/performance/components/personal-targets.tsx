"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, DollarSign, Building2, Eye, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TargetMetric {
  id: string
  label: string
  icon: React.ReactNode
  current: number
  target: number
  min?: number
  max: number
  unit: string
  color: string
}

const defaultTargets: TargetMetric[] = [
  {
    id: "deals",
    label: "Monthly Deals",
    icon: <TrendingUp className="h-4 w-4" />,
    current: 3,
    target: 5,
    max: 15,
    unit: "deals",
    color: "bg-green-500",
  },
  {
    id: "commission",
    label: "Commission Target",
    icon: <DollarSign className="h-4 w-4" />,
    current: 85000,
    target: 125000,
    min: 10000,
    max: 150000,
    unit: "AED",
    color: "bg-blue-500",
  },
  {
    id: "listings",
    label: "New Listings",
    icon: <Building2 className="h-4 w-4" />,
    current: 8,
    target: 12,
    max: 30,
    unit: "listings",
    color: "bg-purple-500",
  },
  {
    id: "viewings",
    label: "Property Viewings",
    icon: <Eye className="h-4 w-4" />,
    current: 22,
    target: 30,
    max: 60,
    unit: "viewings",
    color: "bg-orange-500",
  },
]

export function PersonalTargets() {
  const [targets, setTargets] = useState<TargetMetric[]>(defaultTargets)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleTargetChange = (id: string, newTarget: number) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, target: newTarget } : t))
    )
    setHasChanges(true)
  }

  const saveTargets = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Targets saved successfully!")
      setHasChanges(false)
    } catch {
      toast.error("Failed to save targets")
    } finally {
      setSaving(false)
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "AED") {
      return `${(value / 1000).toFixed(0)}K AED`
    }
    return `${value} ${unit}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Personal Targets</CardTitle>
          </div>
          <Button
            onClick={saveTargets}
            disabled={!hasChanges || saving}
            size="sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Targets
          </Button>
        </div>
        <CardDescription>
          Set your monthly goals and track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {targets.map((metric) => {
          const progress = Math.min((metric.current / metric.target) * 100, 100)
          const isAchieved = metric.current >= metric.target

          return (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.color}/10`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="font-medium">{metric.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatValue(metric.current, metric.unit)} / {formatValue(metric.target, metric.unit)}
                    </p>
                  </div>
                </div>
                <Badge variant={isAchieved ? "default" : "outline"}>
                  {progress.toFixed(0)}%
                </Badge>
              </div>

              <Progress value={progress} className="h-2" />

              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-16">
                  Target:
                </span>
                <Slider
                  value={[metric.target]}
                  min={metric.min ?? 1}
                  max={metric.max}
                  step={metric.unit === "AED" ? 5000 : 1}
                  onValueChange={([value]) => handleTargetChange(metric.id, value)}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-20 text-right">
                  {formatValue(metric.target, metric.unit)}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
