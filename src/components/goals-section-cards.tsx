import type { Goal } from "./goals-data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTargetArrow, IconCalendarTime, IconTrendingUp } from "@tabler/icons-react";
import { useCurrency } from "@/components/currency-context";

interface GoalsSectionCardsProps {
  goals: Goal[];
}

export function GoalsSectionCards({ goals }: GoalsSectionCardsProps) {
  const { currency } = useCurrency();
  // Total goals
  const totalGoals = goals.length;
  // Most funded goal (by current amount)
  const mostFunded = goals.reduce((max, g) => (g.current > (max?.current ?? -Infinity) ? g : max), goals[0]);
  // Next deadline (soonest future date)
  const now = new Date();
  const nextDeadline = goals
    .filter(g => new Date(g.deadline) >= now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
  // Average progress
  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.current / g.target) * 100), 0) / goals.length)
    : 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Goals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconTargetArrow className="text-primary" /> {totalGoals}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Active this year <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Most Funded</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconTargetArrow className="text-primary" /> {mostFunded ? mostFunded.name : "-"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {mostFunded ? `${currency.symbol}${mostFunded.current.toLocaleString()} saved` : "-"}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Next Deadline</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconCalendarTime className="text-primary" /> {nextDeadline ? nextDeadline.name : "-"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {nextDeadline ? `Due ${nextDeadline.deadline}` : "-"}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconTrendingUp className="text-primary" /> {avgProgress}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Across all goals
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
