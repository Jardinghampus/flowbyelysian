"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Flame,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  previousRank: number
  name: string
  avatar?: string
  initials: string
  deals: number
  revenue: number
  commission: number
  streak: number
  points: number
  isCurrentUser?: boolean
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 2,
    name: "Ahmed Al Maktoum",
    initials: "AM",
    deals: 8,
    revenue: 15200000,
    commission: 456000,
    streak: 12,
    points: 2450,
  },
  {
    rank: 2,
    previousRank: 1,
    name: "Sarah Johnson",
    initials: "SJ",
    deals: 6,
    revenue: 9800000,
    commission: 294000,
    streak: 5,
    points: 1890,
  },
  {
    rank: 3,
    previousRank: 3,
    name: "Mohammed Rashid",
    initials: "MR",
    deals: 5,
    revenue: 8500000,
    commission: 255000,
    streak: 8,
    points: 1650,
    isCurrentUser: true,
  },
  {
    rank: 4,
    previousRank: 5,
    name: "Emma Williams",
    initials: "EW",
    deals: 4,
    revenue: 6250000,
    commission: 187500,
    streak: 3,
    points: 1320,
  },
  {
    rank: 5,
    previousRank: 4,
    name: "Ali Hassan",
    initials: "AH",
    deals: 3,
    revenue: 4200000,
    commission: 126000,
    streak: 0,
    points: 980,
  },
  {
    rank: 6,
    previousRank: 7,
    name: "Fatima Al Nahyan",
    initials: "FN",
    deals: 2,
    revenue: 1800000,
    commission: 54000,
    streak: 2,
    points: 720,
  },
  {
    rank: 7,
    previousRank: 6,
    name: "John Smith",
    initials: "JS",
    deals: 2,
    revenue: 1650000,
    commission: 49500,
    streak: 0,
    points: 680,
  },
  {
    rank: 8,
    previousRank: 8,
    name: "Layla Ahmed",
    initials: "LA",
    deals: 1,
    revenue: 950000,
    commission: 28500,
    streak: 1,
    points: 450,
  },
]

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`
  }
  return amount.toString()
}

const RankChange = ({ current, previous }: { current: number; previous: number }) => {
  const diff = previous - current

  if (diff > 0) {
    return (
      <span className="flex items-center text-green-500 text-xs">
        <ChevronUp className="h-3 w-3" />
        {diff}
      </span>
    )
  }
  if (diff < 0) {
    return (
      <span className="flex items-center text-red-500 text-xs">
        <ChevronDown className="h-3 w-3" />
        {Math.abs(diff)}
      </span>
    )
  }
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
        <Crown className="h-4 w-4 text-white" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{rank}</span>
    </div>
  )
}

export function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly")
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard)

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Compete with your team and climb the ranks
              </CardDescription>
            </div>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
            <TabsList>
              <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs sm:text-sm">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Second Place */}
          <div className="order-1 flex flex-col items-center pt-6">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-slate-300">
              <AvatarImage src={topThree[1]?.avatar} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm sm:text-base">
                {topThree[1]?.initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <p className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-full">
                {topThree[1]?.name.split(" ")[0]}
              </p>
              <p className="text-xs text-muted-foreground">{topThree[1]?.points} pts</p>
            </div>
            <div className="mt-2 h-16 sm:h-20 w-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-400">2</span>
            </div>
          </div>

          {/* First Place */}
          <div className="order-2 flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-amber-400">
                <AvatarImage src={topThree[0]?.avatar} />
                <AvatarFallback className="bg-amber-100 text-amber-600 text-base sm:text-lg">
                  {topThree[0]?.initials}
                </AvatarFallback>
              </Avatar>
              <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-amber-500" />
            </div>
            <div className="mt-2 text-center">
              <p className="font-semibold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-full">
                {topThree[0]?.name.split(" ")[0]}
              </p>
              <p className="text-xs text-amber-600 font-medium">{topThree[0]?.points} pts</p>
            </div>
            <div className="mt-2 h-20 sm:h-24 w-full bg-gradient-to-t from-amber-400 to-amber-300 dark:from-amber-600 dark:to-amber-500 rounded-t-lg flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
            </div>
          </div>

          {/* Third Place */}
          <div className="order-3 flex flex-col items-center pt-10">
            <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-amber-600">
              <AvatarImage src={topThree[2]?.avatar} />
              <AvatarFallback className="bg-amber-50 text-amber-700 text-xs sm:text-sm">
                {topThree[2]?.initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-2 text-center">
              <p className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-full">
                {topThree[2]?.name.split(" ")[0]}
              </p>
              <p className="text-xs text-muted-foreground">{topThree[2]?.points} pts</p>
            </div>
            <div className="mt-2 h-12 sm:h-16 w-full bg-gradient-to-t from-amber-700 to-amber-600 dark:from-amber-800 dark:to-amber-700 rounded-t-lg flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-white">3</span>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="space-y-2">
          {rest.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                entry.isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              )}
            >
              <RankBadge rank={entry.rank} />
              <RankChange current={entry.rank} previous={entry.previousRank} />
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback className="text-xs">{entry.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  entry.isCurrentUser && "text-primary"
                )}>
                  {entry.name}
                  {entry.isCurrentUser && (
                    <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                  )}
                </p>
              </div>
              {entry.streak > 0 && (
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-medium">{entry.streak}</span>
                </div>
              )}
              <div className="text-right">
                <p className="font-semibold text-sm">{entry.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Quick Stats */}
        <div className="p-4 rounded-lg bg-muted/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">3rd</p>
            <p className="text-xs text-muted-foreground">Your Rank</p>
          </div>
          <div>
            <p className="text-2xl font-bold">1,650</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">8</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
