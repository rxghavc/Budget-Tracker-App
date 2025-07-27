"use client";

import * as React from "react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth-context";

const chartConfig = {
  income: {
    label: "Income",
    color: "#0ea5e9",
  },
};

// Remove Supabase fetching from IncomeChart
export function IncomeChart({ data }: { data: { date: string; amount: number }[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("Last 3 months");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) setTimeRange("Last 7 days");
  }, [isMobile]);

  // Compute chart data: sum all income per day
  const chartData = React.useMemo(() => {
    const totals: Record<string, number> = {};
    for (const i of data) {
      const dateStr = typeof i.date === "string" ? i.date : new Date(i.date).toISOString().slice(0, 10);
      if (!totals[dateStr]) totals[dateStr] = 0;
      totals[dateStr] += Number(i.amount);
    }
    return Object.entries(totals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Filter data by time range
  const today = new Date();
  let daysToSubtract = 90;
  if (timeRange === "Last 30 days") daysToSubtract = 30;
  if (timeRange === "Last 7 days") daysToSubtract = 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToSubtract);
  const filteredData = chartData.filter((d) => new Date(d.date) >= startDate && new Date(d.date) <= today);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Income Over Time</CardTitle>
        <CardDescription>
          {timeRange === "Last 3 months" && <span>Last 3 months</span>}
          {timeRange === "Last 30 days" && <span>Last 30 days</span>}
          {timeRange === "Last 7 days" && <span>Last 7 days</span>}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={v => v && setTimeRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="Last 7 days">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="Last 30 days">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="Last 3 months">Last 3 months</ToggleGroupItem>
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
              <SelectItem value="Last 3 months" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="Last 30 days" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="Last 7 days" className="rounded-lg">
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
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
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
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={-1}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="url(#fillIncome)"
              stroke="#0ea5e9"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
