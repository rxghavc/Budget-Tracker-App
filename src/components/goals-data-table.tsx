import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useCurrency } from "@/components/currency-context";

export interface Goal {
  id?: string; // uuid from Supabase
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

interface GoalsDataTableProps {
  data: Goal[];
  onDelete?: (idx: number) => void;
  onEditOpen?: (idx: number) => void;
  currency?: { symbol: string };
  selectedEditGoalIdx?: number | null;
  setSelectedEditGoalIdx?: (idx: number | null) => void;
  setEditPopoverOpen?: (open: boolean) => void;
  // For backward compatibility
  onDeleteGoal?: (idx: number) => void;
}

export function GoalsDataTable({
  data,
  onDelete,
  onEditOpen,
  currency: currencyProp,
  selectedEditGoalIdx,
  setSelectedEditGoalIdx,
  setEditPopoverOpen,
  onDeleteGoal,
}: GoalsDataTableProps) {
  const { currency: contextCurrency } = useCurrency();
  const currency = currencyProp || contextCurrency;
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="py-2 text-left">Goal</TableHead>
              <TableHead className="py-2 text-right">Target</TableHead>
              <TableHead className="py-2 text-right">Saved</TableHead>
              <TableHead className="py-2 text-right">Progress</TableHead>
              <TableHead className="py-2 text-right">Deadline</TableHead>
              <TableHead className="py-2 text-right">Category</TableHead>
              <TableHead className="py-2 text-right">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((g, idx) => {
              const percent = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <TableRow key={g.id || g.name} className="border-b last:border-0">
                  <TableCell className="py-2 font-medium">{g.name}</TableCell>
                  <TableCell className="py-2 text-right">{currency.symbol}{g.target.toLocaleString()}</TableCell>
                  <TableCell className="py-2 text-right">{currency.symbol}{g.current.toLocaleString()}</TableCell>
                  <TableCell className="py-2 text-right">
                    <span
                      className={
                        percent >= 100
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : new Date(g.deadline) <= new Date()
                          ? "text-orange-500 dark:text-orange-400 font-semibold"
                          : "font-medium"
                      }
                    >
                      {percent}%
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-right">{g.deadline}</TableCell>
                  <TableCell className="py-2 text-right">
                    <Badge variant="outline">{g.category}</Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right flex justify-end gap-2">
                    {(onDelete || onDeleteGoal) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="p-1.5 h-7 w-7 flex items-center justify-center"
                            onClick={() => (onDelete ? onDelete(idx) : onDeleteGoal?.(idx))}
                            type="button"
                            aria-label="Delete goal"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" /></svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    )}
                    {onEditOpen && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1.5 h-7 w-7 flex items-center justify-center"
                            onClick={() => {
                              setSelectedEditGoalIdx?.(idx);
                              setEditPopoverOpen?.(true);
                              onEditOpen(idx);
                            }}
                            type="button"
                            aria-label="Edit goal"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17.25V21h3.75l11.06-11.06a2.121 2.121 0 10-3-3L3 17.25z" /></svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
