"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartData = [
  { date: "2024-04-01", conversions: 18, deals: 4 },
  { date: "2024-04-02", conversions: 22, deals: 5 },
  { date: "2024-04-03", conversions: 15, deals: 3 },
  { date: "2024-04-04", conversions: 28, deals: 7 },
  { date: "2024-04-05", conversions: 32, deals: 8 },
  { date: "2024-04-06", conversions: 25, deals: 6 },
  { date: "2024-04-07", conversions: 20, deals: 4 },
  { date: "2024-04-08", conversions: 35, deals: 9 },
  { date: "2024-04-09", conversions: 12, deals: 2 },
  { date: "2024-04-10", conversions: 24, deals: 5 },
  { date: "2024-04-11", conversions: 30, deals: 7 },
  { date: "2024-04-12", conversions: 26, deals: 6 },
  { date: "2024-04-13", conversions: 33, deals: 8 },
  { date: "2024-04-14", conversions: 16, deals: 3 },
  { date: "2024-04-15", conversions: 14, deals: 3 },
  { date: "2024-04-16", conversions: 19, deals: 4 },
  { date: "2024-04-17", conversions: 38, deals: 10 },
  { date: "2024-04-18", conversions: 34, deals: 8 },
  { date: "2024-04-19", conversions: 22, deals: 5 },
  { date: "2024-04-20", conversions: 10, deals: 2 },
  { date: "2024-04-21", conversions: 15, deals: 3 },
  { date: "2024-04-22", conversions: 21, deals: 5 },
  { date: "2024-04-23", conversions: 17, deals: 4 },
  { date: "2024-04-24", conversions: 36, deals: 9 },
  { date: "2024-04-25", conversions: 23, deals: 5 },
  { date: "2024-04-26", conversions: 9, deals: 2 },
  { date: "2024-04-27", conversions: 37, deals: 9 },
  { date: "2024-04-28", conversions: 14, deals: 3 },
  { date: "2024-04-29", conversions: 29, deals: 7 },
  { date: "2024-04-30", conversions: 40, deals: 10 },
  { date: "2024-05-01", conversions: 18, deals: 4 },
  { date: "2024-05-02", conversions: 27, deals: 6 },
  { date: "2024-05-03", conversions: 23, deals: 5 },
  { date: "2024-05-04", conversions: 35, deals: 8 },
  { date: "2024-05-05", conversions: 42, deals: 11 },
  { date: "2024-05-06", conversions: 45, deals: 12 },
  { date: "2024-05-07", conversions: 36, deals: 9 },
  { date: "2024-05-08", conversions: 16, deals: 3 },
  { date: "2024-05-09", conversions: 21, deals: 5 },
  { date: "2024-05-10", conversions: 28, deals: 7 },
  { date: "2024-05-11", conversions: 31, deals: 7 },
  { date: "2024-05-12", conversions: 20, deals: 4 },
  { date: "2024-05-13", conversions: 19, deals: 4 },
  { date: "2024-05-14", conversions: 41, deals: 10 },
  { date: "2024-05-15", conversions: 43, deals: 11 },
  { date: "2024-05-16", conversions: 32, deals: 8 },
  { date: "2024-05-17", conversions: 46, deals: 12 },
  { date: "2024-05-18", conversions: 30, deals: 7 },
  { date: "2024-05-19", conversions: 22, deals: 5 },
  { date: "2024-05-20", conversions: 18, deals: 4 },
  { date: "2024-05-21", conversions: 11, deals: 2 },
  { date: "2024-05-22", conversions: 10, deals: 2 },
  { date: "2024-05-23", conversions: 24, deals: 6 },
  { date: "2024-05-24", conversions: 27, deals: 6 },
  { date: "2024-05-25", conversions: 21, deals: 5 },
  { date: "2024-05-26", conversions: 20, deals: 4 },
  { date: "2024-05-27", conversions: 39, deals: 10 },
  { date: "2024-05-28", conversions: 22, deals: 5 },
  { date: "2024-05-29", conversions: 9, deals: 2 },
  { date: "2024-05-30", conversions: 32, deals: 8 },
  { date: "2024-05-31", conversions: 19, deals: 4 },
  { date: "2024-06-01", conversions: 19, deals: 4 },
  { date: "2024-06-02", conversions: 44, deals: 11 },
  { date: "2024-06-03", conversions: 12, deals: 3 },
  { date: "2024-06-04", conversions: 40, deals: 10 },
  { date: "2024-06-05", conversions: 10, deals: 2 },
  { date: "2024-06-06", conversions: 28, deals: 7 },
  { date: "2024-06-07", conversions: 31, deals: 7 },
  { date: "2024-06-08", conversions: 36, deals: 9 },
  { date: "2024-06-09", conversions: 41, deals: 10 },
  { date: "2024-06-10", conversions: 17, deals: 4 },
  { date: "2024-06-11", conversions: 11, deals: 2 },
  { date: "2024-06-12", conversions: 45, deals: 11 },
  { date: "2024-06-13", conversions: 10, deals: 2 },
  { date: "2024-06-14", conversions: 39, deals: 10 },
  { date: "2024-06-15", conversions: 29, deals: 7 },
  { date: "2024-06-16", conversions: 35, deals: 8 },
  { date: "2024-06-17", conversions: 44, deals: 11 },
  { date: "2024-06-18", conversions: 13, deals: 3 },
  { date: "2024-06-19", conversions: 32, deals: 8 },
  { date: "2024-06-20", conversions: 38, deals: 9 },
  { date: "2024-06-21", conversions: 18, deals: 4 },
  { date: "2024-06-22", conversions: 30, deals: 7 },
  { date: "2024-06-23", conversions: 47, deals: 12 },
  { date: "2024-06-24", conversions: 15, deals: 3 },
  { date: "2024-06-25", conversions: 16, deals: 3 },
  { date: "2024-06-26", conversions: 40, deals: 10 },
  { date: "2024-06-27", conversions: 42, deals: 11 },
  { date: "2024-06-28", conversions: 17, deals: 4 },
  { date: "2024-06-29", conversions: 12, deals: 3 },
  { date: "2024-06-30", conversions: 41, deals: 10 },
]

const chartConfig = {
  metrics: {
    label: "Metrics",
  },
  conversions: {
    label: "Conversions",
    color: "#8b5cf6", // Purple
  },
  deals: {
    label: "Deals Closed",
    color: "#3b82f6", // Blue
  },
} satisfies ChartConfig

export function PerformanceChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Conversions and deals for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#a855f7"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDeals" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#60a5fa"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#3b82f6"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value as string | number | Date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="deals"
              type="natural"
              fill="url(#fillDeals)"
              stroke="var(--color-deals)"
              stackId="a"
            />
            <Area
              dataKey="conversions"
              type="natural"
              fill="url(#fillConversions)"
              stroke="var(--color-conversions)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
