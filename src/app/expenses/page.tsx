"use client";

import { ExpensesSectionCards } from "@/components/expenses-section-cards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartExpensesOverTime } from "@/components/chart-expenses-over-time";
import expensesRaw from "./expenses.json";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExpensesDataTable } from "@/components/expenses-data-table";
import React, { useRef } from "react";
import { useExpenses } from "@/components/expenses-context";
import { useCurrency } from "@/components/currency-context";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";

// Expense type
interface Expense {
  id: string; // uuid from Supabase
  user_id?: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

export default function ExpensesPage() {
  const { isLoggedIn, user } = useAuth();
  const { currency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[] | null>(null); // null means not loaded yet
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: "",
    category: "",
    notes: "",
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editPopoverOpen, setEditPopoverOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    date: "",
    category: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch expenses from Supabase for logged-in user
  React.useEffect(() => {
    if (isLoggedIn === false) {
      setExpenses(expensesRaw as Expense[]);
    } else if (isLoggedIn && user?.id) {
      setLoading(true);
      const supabase = createClient();
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .then((res) => {
          setLoading(false);
          setExpenses(res.data || []);
        });
    } else {
      setExpenses(null); // Not logged in, not sure yet
    }
  }, [isLoggedIn, user?.id]);

  // Compute chart data: sum all expenses per day
  const chartData = React.useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of expenses || []) {
      if (!totals[e.date]) totals[e.date] = 0;
      totals[e.date] += e.amount;
    }
    // Sort by date ascending for chart
    return Object.entries(totals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses]);

  // Only include expenses up to today for summary cards
  const today = new Date();
  const [showFuture, setShowFuture] = useState(false);
  const visibleExpenses = React.useMemo(
    () => (expenses ? (showFuture ? expenses : expenses.filter(e => new Date(e.date) <= today)) : []),
    [expenses, today, showFuture]
  );

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount || !form.date || !form.category) return;
    // Ensure date is in ISO format (YYYY-MM-DD)
    const isoDate = new Date(form.date).toISOString().slice(0, 10);
    const newExpense = {
      name: form.name,
      amount: Number(form.amount),
      date: isoDate,
      category: form.category,
      notes: form.notes,
      user_id: user?.id,
    };
    if (isLoggedIn && user?.id) {
      setLoading(true);
      const supabase = createClient();
      supabase
        .from("expenses")
        .insert([newExpense])
        .select()
        .then(({ data, error }) => {
          setLoading(false);
          if (!error && data && data[0]) {
            setExpenses((prev) => (Array.isArray(prev) ? [...prev, { ...data[0], id: String(data[0].id) }] : [{ ...data[0], id: String(data[0].id) }]));
          }
        });
    } else {
      setExpenses((prev) => (Array.isArray(prev) ? [...prev, { ...newExpense, id: Math.random().toString() }] : [{ ...newExpense, id: Math.random().toString() }]));
    }
    setForm({ name: "", amount: "", date: "", category: "", notes: "" });
  }

  function handleDeleteExpense(idx: number) {
    if (!visibleExpenses || !expenses) return;
    // Find the expense in the visible list
    const expenseToDelete = visibleExpenses[idx];
    if (!expenseToDelete) return;
    if (isLoggedIn && expenseToDelete.id) {
      setLoading(true);
      const supabase = createClient();
      supabase
        .from("expenses")
        .delete()
        .eq("id", expenseToDelete.id)
        .eq("user_id", user?.id)
        .then(({ error }) => {
          setLoading(false);
          if (!error) setExpenses((prev) => prev ? prev.filter((e) => e.id !== expenseToDelete.id) : prev);
        });
    } else {
      setExpenses((prev) => prev ? prev.filter((e) => e.id !== expenseToDelete.id) : prev);
    }
  }

  function handleEditExpense(idx: number) {
    if (!expenses) return;
    setEditIdx(idx);
    const exp = expenses[idx];
    setEditForm({
      name: exp.name,
      amount: exp.amount.toString(),
      date: exp.date,
      category: exp.category,
      notes: exp.notes || "",
    });
    setEditPopoverOpen(true);
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleEditExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editIdx === null || !expenses) return;
    const old = expenses[editIdx];
    if (!old) return;
    // Ensure date is in ISO format (YYYY-MM-DD)
    const isoDate = new Date(editForm.date).toISOString().slice(0, 10);
    const updated = {
      name: editForm.name,
      amount: Number(editForm.amount),
      date: isoDate,
      category: editForm.category,
      notes: editForm.notes,
    };
    if (isLoggedIn && old.id) {
      setLoading(true);
      const supabase = createClient();
      supabase
        .from("expenses")
        .update(updated)
        .eq("id", old.id)
        .eq("user_id", user?.id)
        .select()
        .then(({ error }) => {
          setLoading(false);
          if (!error) setExpenses((prev) => prev ? prev.map((e, i) => (i === editIdx ? { ...old, ...updated } : e)) : prev);
        });
    } else {
      setExpenses((prev) => prev ? prev.map((e, i) => (i === editIdx ? { ...e, ...updated } : e)) : prev);
    }
    setEditPopoverOpen(false);
    setEditIdx(null);
  }

  // Sort expenses by date (newest first) for display
  const sortedExpenses = expenses ? [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  if ((isLoggedIn && (expenses === null || loading))) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* 1. Summary Cards Skeleton */}
            <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse mb-4" />
            {/* 2. Expenses Over Time Chart Skeleton */}
            <div className="px-4 lg:px-6">
              <div className="h-48 w-full bg-muted/50 rounded-lg animate-pulse" />
            </div>
            {/* 3. Expenses Controls & Actions Skeleton */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Controls</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">Add your expense records.</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="default" disabled>Add Expense</Button>
                </CardContent>
              </Card>
            </div>
            {/* 4. Expenses Table Skeleton */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logged Expenses</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm flex items-center gap-1">
                      <input type="checkbox" checked={false} disabled className="accent-primary" />
                      Show future expenses
                    </label>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full animate-pulse">
                    <div className="h-10 bg-muted/50 rounded mb-2" />
                    <div className="h-10 bg-muted/50 rounded mb-2" />
                    <div className="h-10 bg-muted/50 rounded mb-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* 1. Summary Cards */}
          <ExpensesSectionCards expenses={visibleExpenses} />

          {/* 2. Expenses Over Time Chart */}
          <div className="px-4 lg:px-6">
            <ChartExpensesOverTime data={visibleExpenses} />
          </div>

          {/* 3. Expenses Controls & Actions */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Controls</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Add your expense records.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default">Add Expense</Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[350px] p-4">
                    <h3 className="text-lg font-semibold mb-2">Add a New Expense</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleAddExpense}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Expense name"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.name}
                        onChange={handleFormChange}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="amount"
                          placeholder="Amount"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={form.amount}
                          onChange={handleFormChange}
                        />
                      </div>
                      <input
                        type="date"
                        name="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.date}
                        onChange={handleFormChange}
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.category}
                        onChange={handleFormChange}
                      />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes (optional)"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.notes}
                        onChange={handleFormChange}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" variant="default" size="sm">
                          Add Expense
                        </Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
                {/* Edit Expense Popover (simple, not anchored to button) */}
                <Popover open={editPopoverOpen} onOpenChange={setEditPopoverOpen}>
                  <PopoverTrigger asChild>
                    {/* Hidden trigger for programmatic open */}
                    <span style={{ display: "none" }} />
                  </PopoverTrigger>
                  <PopoverContent align="center" side="top" sideOffset={32} className="w-[350px] p-4 z-[9999]">
                    <h3 className="text-lg font-semibold mb-2">Edit Expense</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleEditExpenseSubmit}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Expense name"
                        className="border rounded px-2 py-1 text-sm"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="amount"
                          placeholder="Amount"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={editForm.amount}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <input
                        type="date"
                        name="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={editForm.date}
                        onChange={handleEditFormChange}
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        className="border rounded px-2 py-1 text-sm"
                        value={editForm.category}
                        onChange={handleEditFormChange}
                      />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes (optional)"
                        className="border rounded px-2 py-1 text-sm"
                        value={editForm.notes}
                        onChange={handleEditFormChange}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" variant="default" size="sm">
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditPopoverOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          </div>

          {/* 4. Expenses Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Logged Expenses</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={showFuture}
                      onChange={e => setShowFuture(e.target.checked)}
                      className="accent-primary"
                    />
                    Show future expenses
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <ExpensesDataTable
                  data={visibleExpenses}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}