import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useCurrency } from "@/components/currency-context"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function BudgetSectionCards({ budgets, expenses }: { budgets: { category: string; value: number; color: string }[]; expenses: { category: string; amount: number; date?: string }[] }) {
  const { currency } = useCurrency();
  // Only count expenses in current month and year, and not in the future
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const filteredExpenses = expenses.filter((e) => {
    if (!e.category || !e.date) return false;
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year && d <= now;
  });
  const totalBudget = budgets.reduce((sum, b) => sum + b.value, 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const spent = filteredExpenses
      .filter(e => e.category.toLowerCase() === b.category.toLowerCase())
      .reduce((s, e) => s + e.amount, 0);
    return sum + spent;
  }, 0);
  const remaining = totalBudget - totalSpent;
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Budget Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Budget</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currency.symbol}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            {/* Removed dynamic badge for Total Budget card */}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            This is your total planned budget for all categories.
          </div>
          <div className="text-muted-foreground">
            Adjust your budgets in each category to match your goals.
          </div>
        </CardFooter>
      </Card>
      {/* Total Spent Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Spent</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600 dark:text-red-400">
            {currency.symbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {utilization < 90 ? <IconTrendingDown /> : <IconTrendingUp />} 
              {utilization < 90 ? 'Low' : 'High'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {utilization < 90 ? 'Spending under control' : 'Spending high'} {utilization < 90 ? <IconTrendingDown className="size-4" /> : <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {utilization < 90 ? 'Good job staying under budget' : 'Watch your spending!'}
          </div>
        </CardFooter>
      </Card>
      {/* Remaining Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Remaining</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600 dark:text-green-400">
            {currency.symbol}{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {remaining > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {remaining > 0 ? 'On track' : 'Over budget'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {remaining > 0 ? 'Good remaining budget' : 'Budget exceeded'} {remaining > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            {remaining > 0 ? 'For this period' : 'Please review your spending'}
          </div>
        </CardFooter>
      </Card>
      {/* Utilization Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utilization</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {utilization}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {utilization < 90 ? <IconTrendingDown /> : <IconTrendingUp />} 
              {utilization < 90 ? 'Good' : 'High'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {utilization < 90 ? 'Utilization healthy' : 'Utilization high'}
          </div>
          <div className="text-muted-foreground">
            Under 90% is optimal
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
