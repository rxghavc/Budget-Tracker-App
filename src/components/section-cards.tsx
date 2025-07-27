"use client";

import { useIncome } from "@/components/income-context";
import { useExpenses } from "@/components/expenses-context";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCurrency } from "@/components/currency-context";

function getCurrentMonth() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

export function SectionCards({ expensesList: propExpensesList, incomeList: propIncomeList }: { expensesList?: any[]; incomeList?: any[] } = {}) {
  const { currency } = useCurrency();
  const { incomeList: contextIncomeList } = useIncome();
  const { expensesList: contextExpensesList } = useExpenses();
  const expensesList = propExpensesList || contextExpensesList;
  const incomeList = propIncomeList || contextIncomeList;
  // Only consider transactions from this month
  const month = getCurrentMonth();
  const thisMonth = expensesList.filter((d) => d.date.startsWith(month));
  const thisMonthIncome = incomeList.filter((d) => d.date.startsWith(month));
  const totalSpent = thisMonth.reduce((sum, d) => sum + d.amount, 0);
  const totalIncome = thisMonthIncome.reduce((sum, d) => sum + d.amount, 0);
  const netSavings = totalIncome - totalSpent;
  const largest = thisMonth.reduce((max, d) => (d.amount > (max?.amount ?? -Infinity) ? d : max), thisMonth[0]);
  const categoryCounts = thisMonth.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequentCategory = Object.entries(categoryCounts as Record<string, number>).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const numTransactions = thisMonth.length;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Only 4 cards below, using live context data */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currency.symbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Income entries: {thisMonthIncome.length}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currency.symbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Across {numTransactions} transactions</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Savings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currency.symbol}{netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Income - Expenses</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {largest ? `${largest.name} (${currency.symbol}${largest.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "-"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{largest ? `On ${largest.date}` : "No data"}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
