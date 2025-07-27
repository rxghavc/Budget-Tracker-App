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
  ChartConfig,
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
import { useIncome } from "@/components/income-context"
import { useExpenses } from "@/components/expenses-context"

export const description = "An interactive area chart"

const chartConfig = {
  income: {
    label: "Income",
    color: "#22c55e", // green
  },
  expenses: {
    label: "Expenses",
    color: "#ef4444", // red
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ expensesList: propExpensesList, incomeList: propIncomeList }: { expensesList?: any[]; incomeList?: any[] } = {}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { incomeList: contextIncomeList } = useIncome()
  const { expensesList: contextExpensesList } = useExpenses()
  const incomeList = propIncomeList || contextIncomeList
  const expensesList = propExpensesList || contextExpensesList

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Build a date-indexed map for income and expenses
  const incomeByDate: Record<string, number> = {}
  for (const i of incomeList) {
    if (!incomeByDate[i.date]) incomeByDate[i.date] = 0
    incomeByDate[i.date] += i.amount
  }
  const expensesByDate: Record<string, number> = {}
  for (const e of expensesList) {
    if (!expensesByDate[e.date]) expensesByDate[e.date] = 0
    expensesByDate[e.date] += e.amount
  }

  // Build a list of all dates in either income or expenses
  const allDates = Array.from(new Set([
    ...Object.keys(incomeByDate),
    ...Object.keys(expensesByDate),
  ])).sort()

  // Build cumulative chart data for each date
  let runningIncome = 0
  let runningExpenses = 0
  const liveChartData = allDates.map(date => {
    runningIncome += incomeByDate[date] || 0
    runningExpenses += expensesByDate[date] || 0
    return {
      date,
      income: runningIncome,
      expenses: runningExpenses,
      net: runningIncome - runningExpenses,
    }
  })

  // Use the latest date as reference
  const referenceDate = allDates.length > 0 ? new Date(allDates[allDates.length - 1]) : new Date()
  let daysToSubtract = 90
  if (timeRange === "30d") daysToSubtract = 30
  else if (timeRange === "7d") daysToSubtract = 7
  const startDate = new Date(referenceDate)
  startDate.setDate(startDate.getDate() - daysToSubtract)
  const filteredData = liveChartData.filter(item => {
    const date = new Date(item.date)
    return date >= startDate && date <= referenceDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cumulative Income & Expenses
          <span className="relative group">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle text-muted-foreground cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
            <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded bg-background px-3 py-2 text-xs text-foreground shadow-lg group-hover:block border border-border top-6">
              This chart shows the cumulative totals for income and expenses over time.
            </span>
          </span>
        </CardTitle>
        <CardDescription>
          {timeRange === "90d" && (
            <>
              <span className="hidden @[540px]/card:block">Last 3 months</span>
              <span className="@[540px]/card:hidden">Last 3 months</span>
            </>
          )}
          {timeRange === "30d" && (
            <>
              <span className="hidden @[540px]/card:block">Last 30 days</span>
              <span className="@[540px]/card:hidden">Last 30 days</span>
            </>
          )}
          {timeRange === "7d" && (
            <>
              <span className="hidden @[540px]/card:block">Last 7 days</span>
              <span className="@[540px]/card:hidden">Last 7 days</span>
            </>
          )}
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
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
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
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="#22c55e"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="#ef4444"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex gap-4 mt-2 text-xs items-center">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm" style={{background:'#22c55e'}}></span>Income</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm" style={{background:'#ef4444'}}></span>Expenses</span>
        </div>
      </CardContent>
    </Card>
  )
}
