"use client"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { TrendingUp, TrendingDown, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

import agentData from "../../dashboard/data/agent-performance.json"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#8b5cf6", // Purple
  },
  leasing: {
    label: "Leasing",
    color: "#3b82f6", // Blue
  },
} satisfies ChartConfig

export function TargetCommissionChart() {
  const { totals } = agentData

  // Sales data
  const salesTarget = totals.salesTarget
  const salesActual = totals.salesActual
  const salesPercent = totals.salesActualPercent

  // Leasing data
  const leasingTarget = totals.leasingTarget
  const leasingActual = totals.leasingActual
  const leasingPercent = totals.leasingActualPercent

  const salesChartData = [
    { name: "sales", value: Math.min(salesPercent, 100), fill: "url(#salesGradient)" },
  ]

  const leasingChartData = [
    { name: "leasing", value: Math.min(leasingPercent, 100), fill: "url(#leasingGradient)" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Sales Target vs Commission */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Sales Performance
          </CardTitle>
          <CardDescription>Target vs Commission</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={salesChartData}
              startAngle={0}
              endAngle={250 * (salesPercent / 100)}
              innerRadius={80}
              outerRadius={110}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="value" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {salesPercent}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            of target
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            {salesPercent >= 100 ? (
              <>
                Exceeded target by {salesPercent - 100}%
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                {100 - salesPercent}% to go
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            AED {salesActual.toLocaleString()} / AED {salesTarget.toLocaleString()}
          </div>
        </CardFooter>
      </Card>

      {/* Leasing Target vs Commission */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Leasing Performance
          </CardTitle>
          <CardDescription>Target vs Commission</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={leasingChartData}
              startAngle={0}
              endAngle={250 * (leasingPercent / 100)}
              innerRadius={80}
              outerRadius={110}
            >
              <defs>
                <linearGradient id="leasingGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="value" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {leasingPercent}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            of target
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            {leasingPercent >= 100 ? (
              <>
                Exceeded target by {leasingPercent - 100}%
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                {100 - leasingPercent}% to go
                <TrendingDown className="h-4 w-4 text-amber-500" />
              </>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            AED {leasingActual.toLocaleString()} / AED {leasingTarget.toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
