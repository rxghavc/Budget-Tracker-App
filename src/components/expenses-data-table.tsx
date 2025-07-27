"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from "@/components/currency-context";

interface Expense {
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

interface ExpensesDataTableProps {
  data: Expense[];
  onEditExpense?: (idx: number) => void;
  onDeleteExpense?: (idx: number) => void;
}

export function ExpensesDataTable({ data, onEditExpense, onDeleteExpense }: ExpensesDataTableProps) {
  const { currency } = useCurrency();

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  // Sort by date descending (newest first)
  const sorted = React.useMemo(
    () =>
      [...data].sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      }),
    [data]
  );

  // Paginate
  const paginated = React.useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  const pageCount = Math.ceil(sorted.length / pageSize);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="py-2 text-left">Expense</TableHead>
              <TableHead className="py-2 text-left">Category</TableHead>
              <TableHead className="py-2 text-right">Amount</TableHead>
              <TableHead className="py-2 text-right">Date</TableHead>
              <TableHead className="py-2 text-left">Notes</TableHead>
              <TableHead className="py-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? (
              paginated.map((e, idx) => (
                <TableRow key={e.name + e.date + idx} className="border-b last:border-0">
                  <TableCell className="py-2 font-medium">{e.name}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline">{e.category}</Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right font-semibold text-green-600 dark:text-green-400">
                    {currency.symbol}{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-2 text-right text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {e.notes || "-"}
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end items-center gap-2 min-w-[80px]">
                      {onDeleteExpense && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="p-1.5 h-7 w-7 flex items-center justify-center"
                              onClick={() => onDeleteExpense(sorted.indexOf(e))}
                              type="button"
                              aria-label="Delete expense"
                            >
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" /></svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rows per page:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
          >
            {[10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
            First
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPageIndex(i => Math.max(0, i - 1))} disabled={pageIndex === 0}>
            Prev
          </Button>
          <span className="text-sm">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPageIndex(i => Math.min(pageCount - 1, i + 1))} disabled={pageIndex >= pageCount - 1}>
            Next
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
