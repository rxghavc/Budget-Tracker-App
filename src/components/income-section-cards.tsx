import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { IconCoins } from "@tabler/icons-react";
import { useCurrency } from "@/components/currency-context";
import { useIncome } from "@/components/income-context";

interface Income {
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface IncomeSectionCardsProps {
  income: Income[];
}

export function IncomeSectionCards({ income }: IncomeSectionCardsProps) {
  const { currency } = useCurrency();
  // Compute total income, average, etc. from the income array
  const today = new Date();
  const month = today.toISOString().slice(0, 7); // YYYY-MM
  // Only include income up to today for this month
  const thisMonth = income.filter((d) => d.date.startsWith(month) && new Date(d.date) <= today);
  const total = thisMonth.reduce((sum, i) => sum + i.amount, 0);
  const largest = thisMonth.reduce((max, d) => (d.amount > (max?.amount ?? -Infinity) ? d : max), thisMonth[0]);
  const numEntries = thisMonth.length;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income This Month</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconCoins className="text-primary" /> {currency.symbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Entries: {numEntries}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Largest Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            <IconCoins className="text-primary" /> {largest ? `${largest.name} (${currency.symbol}${largest.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : "-"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">{largest ? `On ${largest.date}` : "No data"}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
