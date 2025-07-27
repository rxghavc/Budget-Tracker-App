import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useCurrency } from "@/components/currency-context";
import * as React from "react";

export interface Income {
  id: string; // Add id to the type
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface IncomeDataTableProps {
  data: Income[];
  onEditIncome?: (id: string, updatedIncome: Income) => void;
  onDeleteIncome?: (id: string) => void;
}

export function IncomeDataTable({ data, onEditIncome, onDeleteIncome }: IncomeDataTableProps) {
  const { currency } = useCurrency();
  const [openPopoverIdx, setOpenPopoverIdx] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: "",
    amount: "",
    date: "",
    category: "",
    notes: "",
  });

  // When popover opens, populate form with row data
  React.useEffect(() => {
    if (openPopoverIdx !== null && data[openPopoverIdx]) {
      const inc = data[openPopoverIdx];
      setEditForm({
        name: inc.name,
        amount: inc.amount.toString(),
        date: inc.date,
        category: inc.category,
        notes: inc.notes || "",
      });
    }
  }, [openPopoverIdx, data]);

  function handleEditIncomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (openPopoverIdx === null) return;
    if (!editForm.name || !editForm.amount || !editForm.date || !editForm.category) return;
    const updated = {
      id: data[openPopoverIdx].id, // Pass id
      name: editForm.name,
      amount: Number(editForm.amount),
      date: editForm.date,
      category: editForm.category,
      notes: editForm.notes,
    };
    if (onEditIncome) onEditIncome(data[openPopoverIdx].id, updated);
    setOpenPopoverIdx(null);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="py-2 text-left">Source</TableHead>
              <TableHead className="py-2 text-right">Amount</TableHead>
              <TableHead className="py-2 text-right">Date</TableHead>
              <TableHead className="py-2 text-right">Category</TableHead>
              <TableHead className="py-2 text-right">Notes</TableHead>
              <TableHead className="py-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((inc, idx) => (
              <TableRow key={inc.id} className="border-b last:border-0">
                <TableCell className="py-2 font-medium">{inc.name}</TableCell>
                <TableCell className="py-2 text-right">{currency.symbol}{inc.amount.toLocaleString()}</TableCell>
                <TableCell className="py-2 text-right">{inc.date}</TableCell>
                <TableCell className="py-2 text-right">
                  <Badge variant="outline">{inc.category}</Badge>
                </TableCell>
                <TableCell className="py-2 text-right">{inc.notes || "-"}</TableCell>
                <TableCell className="py-2 text-right flex justify-end gap-2">
                  <Popover open={openPopoverIdx === idx} onOpenChange={(open) => setOpenPopoverIdx(open ? idx : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-1.5 h-7 w-7 flex items-center justify-center"
                        onClick={() => setOpenPopoverIdx(idx)}
                        type="button"
                        aria-label="Edit income"
                      >
                        {/* Pencil icon for edit */}
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L4.293 13.293A1 1 0 004 14v4z" />
                        </svg>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <h3 className="text-lg font-semibold mb-2">Edit Income</h3>
                      <form className="flex flex-col gap-3" onSubmit={handleEditIncomeSubmit}>
                        <input
                          type="text"
                          name="name"
                          placeholder="Income source"
                          className="border rounded px-2 py-1 text-sm"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{currency.symbol}</span>
                          <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            className="border rounded px-2 py-1 text-sm flex-1"
                            value={editForm.amount}
                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                          />
                        </div>
                        <input
                          type="date"
                          name="date"
                          className="border rounded px-2 py-1 text-sm"
                          value={editForm.date}
                          onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        />
                        <input
                          type="text"
                          name="category"
                          placeholder="Category"
                          className="border rounded px-2 py-1 text-sm"
                          value={editForm.category}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        />
                        <input
                          type="text"
                          name="notes"
                          placeholder="Notes (optional)"
                          className="border rounded px-2 py-1 text-sm"
                          value={editForm.notes}
                          onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button type="submit" variant="default" size="sm">
                            Save Changes
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setOpenPopoverIdx(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </PopoverContent>
                  </Popover>
                  {onDeleteIncome && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="p-1.5 h-7 w-7 flex items-center justify-center"
                          onClick={() => onDeleteIncome(inc.id)}
                          type="button"
                          aria-label="Delete income"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" /></svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
