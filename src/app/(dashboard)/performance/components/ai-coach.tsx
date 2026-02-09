"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2
} from "lucide-react"

interface Tip {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "sales" | "marketing" | "networking" | "skills"
}

interface WeeklyFeedback {
  week: string
  summary: string
  strengths: string[]
  improvements: string[]
  actionItems: string[]
}

const mockTips: Tip[] = [
  {
    id: "1",
    title: "Focus on Palm Jumeirah listings",
    description: "Your conversion rate in Palm Jumeirah is 45% higher than other areas. Consider prioritizing viewings there this week.",
    priority: "high",
    category: "sales",
  },
  {
    id: "2",
    title: "Follow up with Q4 leads",
    description: "You have 12 leads from Q4 that haven't been contacted in 30+ days. A quick check-in could revive 2-3 deals.",
    priority: "high",
    category: "sales",
  },
  {
    id: "3",
    title: "Optimize your listing photos",
    description: "Listings with professional photos get 3x more inquiries. Consider investing in a photographer for your next 5 listings.",
    priority: "medium",
    category: "marketing",
  },
  {
    id: "4",
    title: "Attend Dubai Property Show",
    description: "The upcoming property show has historically generated quality leads. Register for the VIP networking event.",
    priority: "medium",
    category: "networking",
  },
  {
    id: "5",
    title: "Complete RERA Advanced course",
    description: "This certification can increase your credibility with high-net-worth clients by 25%.",
    priority: "low",
    category: "skills",
  },
]

const mockWeeklyFeedback: WeeklyFeedback = {
  week: "Feb 3-9, 2025",
  summary: "Strong week with 2 closed deals and 8 new viewings scheduled. Your response time to inquiries improved by 40%.",
  strengths: [
    "Quick response to client inquiries (avg 12 min)",
    "High viewing-to-offer conversion (33%)",
    "Excellent client feedback scores (4.8/5)",
  ],
  improvements: [
    "Follow-up consistency after viewings",
    "Documentation completion time",
    "Cross-selling rental opportunities",
  ],
  actionItems: [
    "Schedule follow-ups within 24h of viewings",
    "Prepare 3 rental listings for sales clients",
    "Update CRM notes for all active deals",
  ],
}

export function AICoach() {
  const [loading, setLoading] = useState(false)
  const [tips, setTips] = useState<Tip[]>(mockTips)
  const [feedback, setFeedback] = useState<WeeklyFeedback>(mockWeeklyFeedback)

  const refreshInsights = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
  }

  const priorityColors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }

  const categoryColors = {
    sales: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    marketing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    networking: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    skills: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AI Performance Coach</CardTitle>
              <CardDescription>
                Personalized insights to help you achieve your goals
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tips" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Tactics & Tips
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-3">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{tip.title}</h4>
                      <Badge className={priorityColors[tip.priority]} variant="secondary">
                        {tip.priority}
                      </Badge>
                      <Badge className={categoryColors[tip.category]} variant="secondary">
                        {tip.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tip.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Week of {feedback.week}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{feedback.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-4 w-4" />
                  Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {feedback.improvements.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Action Items for This Week
              </h4>
              <ul className="space-y-2">
                {feedback.actionItems.map((item, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
