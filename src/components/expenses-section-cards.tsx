import { IconTrendingDown, IconTrendingUp, IconCoins, IconPigMoney, IconReceipt2, IconCalendarStats } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrency } from "@/components/currency-context";

// Expense type (should match the one in the page)
interface Expense {
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

interface ExpensesSectionCardsProps {
  expenses: Expense[];
}

export function ExpensesSectionCards({ expenses }: ExpensesSectionCardsProps) {
  const { currency } = useCurrency();
  // Compute total expenses
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Compute average daily spend (by unique days)
  const days = Array.from(new Set(expenses.map((e) => e.date))).length;
  const avgDaily = days > 0 ? Math.round(total / days) : 0;
  // Find largest expense
  const largest = expenses.reduce(
    (max, e) => (e.amount > max.amount ? e : max),
    expenses[0] || { amount: 0, name: "-", category: "-" }
  );
  // Days tracked
  const daysTracked = days;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconCoins className="text-primary" /> {currency.symbol}{total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp /> {/* Placeholder: +4.2% */}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Across {expenses.length} expenses</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Daily Spend</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconCalendarStats className="text-primary" /> {currency.symbol}{avgDaily.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{daysTracked} days tracked</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconReceipt2 className="text-primary" /> {largest ? `${largest.name} (${currency.symbol}${largest.amount.toLocaleString()})` : "-"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{largest ? `On ${largest.date}` : "-"}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Days Tracked</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconPigMoney className="text-primary" /> {daysTracked}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{daysTracked} unique days</div>
        </CardFooter>
      </Card>
    </div>
  );
}
