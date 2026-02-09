"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Award,
  Crown,
  Gem,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "sales" | "streak" | "milestone" | "special"
  unlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedDate?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

const mockAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Deal",
    description: "Close your first real estate deal",
    icon: <Trophy className="h-6 w-6" />,
    category: "milestone",
    unlocked: true,
    unlockedDate: "Jan 15, 2025",
    rarity: "common",
  },
  {
    id: "2",
    name: "Million Maker",
    description: "Close deals worth over 1M AED total",
    icon: <Gem className="h-6 w-6" />,
    category: "milestone",
    unlocked: true,
    unlockedDate: "Jan 28, 2025",
    rarity: "rare",
  },
  {
    id: "3",
    name: "Hot Streak",
    description: "Close deals 5 days in a row",
    icon: <Flame className="h-6 w-6" />,
    category: "streak",
    unlocked: true,
    unlockedDate: "Feb 2, 2025",
    rarity: "rare",
  },
  {
    id: "4",
    name: "Speed Demon",
    description: "Respond to 50 inquiries within 10 minutes",
    icon: <Zap className="h-6 w-6" />,
    category: "special",
    unlocked: false,
    progress: 38,
    maxProgress: 50,
    rarity: "epic",
  },
  {
    id: "5",
    name: "Top Performer",
    description: "Be #1 on the leaderboard for a month",
    icon: <Crown className="h-6 w-6" />,
    category: "special",
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: "legendary",
  },
  {
    id: "6",
    name: "Network Builder",
    description: "Add 100 contacts to your CRM",
    icon: <Users className="h-6 w-6" />,
    category: "milestone",
    unlocked: false,
    progress: 67,
    maxProgress: 100,
    rarity: "common",
  },
  {
    id: "7",
    name: "Consistent Performer",
    description: "Meet your monthly target 3 months in a row",
    icon: <Target className="h-6 w-6" />,
    category: "streak",
    unlocked: false,
    progress: 2,
    maxProgress: 3,
    rarity: "epic",
  },
  {
    id: "8",
    name: "Growth Champion",
    description: "Increase your monthly revenue by 50%",
    icon: <TrendingUp className="h-6 w-6" />,
    category: "special",
    unlocked: true,
    unlockedDate: "Feb 5, 2025",
    rarity: "rare",
  },
  {
    id: "9",
    name: "Early Bird",
    description: "Schedule 20 viewings before 9 AM",
    icon: <Clock className="h-6 w-6" />,
    category: "special",
    unlocked: false,
    progress: 12,
    maxProgress: 20,
    rarity: "common",
  },
  {
    id: "10",
    name: "Palm Jumeirah Specialist",
    description: "Close 10 deals in Palm Jumeirah",
    icon: <Star className="h-6 w-6" />,
    category: "milestone",
    unlocked: false,
    progress: 6,
    maxProgress: 10,
    rarity: "epic",
  },
]

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-500",
}

const rarityBgColors = {
  common: "bg-slate-100 dark:bg-slate-900/50",
  rare: "bg-blue-50 dark:bg-blue-900/20",
  epic: "bg-purple-50 dark:bg-purple-900/20",
  legendary: "bg-amber-50 dark:bg-amber-900/20",
}

const rarityBorderColors = {
  common: "border-slate-200 dark:border-slate-800",
  rare: "border-blue-200 dark:border-blue-800",
  epic: "border-purple-200 dark:border-purple-800",
  legendary: "border-amber-200 dark:border-amber-800",
}

export function Achievements() {
  const [achievements] = useState<Achievement[]>(mockAchievements)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => {
      const points = { common: 10, rare: 25, epic: 50, legendary: 100 }
      return sum + points[a.rarity]
    }, 0)

  const categories = ["all", "sales", "streak", "milestone", "special"] as const

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Track your progress and unlock rewards
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{unlockedCount}/{achievements.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">{totalPoints} pts</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize text-xs sm:text-sm">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {achievements
                  .filter((a) => cat === "all" || a.category === cat)
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        achievement.unlocked
                          ? rarityBgColors[achievement.rarity]
                          : "bg-muted/30",
                        achievement.unlocked
                          ? rarityBorderColors[achievement.rarity]
                          : "border-muted"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            achievement.unlocked
                              ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white`
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={cn(
                              "font-medium",
                              !achievement.unlocked && "text-muted-foreground"
                            )}>
                              {achievement.name}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "capitalize text-xs",
                                achievement.unlocked && `bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white border-0`
                              )}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {achievement.unlocked ? (
                            <p className="text-xs text-muted-foreground mt-2">
                              Unlocked on {achievement.unlockedDate}
                            </p>
                          ) : (
                            achievement.progress !== undefined && (
                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                                </div>
                                <Progress
                                  value={(achievement.progress / (achievement.maxProgress || 1)) * 100}
                                  className="h-2"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
