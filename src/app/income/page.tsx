"use client";

import { IncomeSectionCards } from "@/components/income-section-cards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IncomeChart } from "@/components/income-chart";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IncomeDataTable } from "@/components/income-data-table";
import { useIncome } from "@/components/income-context";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";
import React from "react";

// Income type
interface Income {
  id: string; // uuid from Supabase, required
  user_id?: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export default function IncomePage() {
  const { user } = useUser();
  const { getToken } = useClerkAuth();
  const isLoggedIn = !!user;
  const { incomeList, addIncome, deleteIncome } = useIncome();
  // Initialize as null to avoid flash of static data
  const [income, setIncome] = useState<Income[] | null>(null);
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

  React.useEffect(() => {
    async function fetchIncome() {
      if (isLoggedIn === false) {
        setIncome(
          incomeList.map(i => ({
            ...i,
            id: typeof i.id === "string" ? i.id : (i.id ? String(i.id) : Math.random().toString())
          }))
        );
        setLoading(false);
      } else if (isLoggedIn && user?.id) {
        setLoading(true);
        const token = await getToken();
        const supabase = createClient(token || undefined);
        supabase.from("income").select("*").eq("user_id", user.id).then((res) => {
          setLoading(false);
          if (res.data) setIncome(res.data);
        });
      } else {
        setIncome(null); // While auth is loading, keep null
        setLoading(true);
      }
    }
    fetchIncome();
  }, [isLoggedIn, user?.id, incomeList]);

  // Only include income up to today for summary cards
  const today = new Date();
  const [showFuture, setShowFuture] = useState(false);
  const visibleIncome = useMemo(
    () => (income ? (showFuture ? income : income.filter(i => new Date(i.date) <= today)) : []),
    [income, today, showFuture]
  );

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAddIncome(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount || !form.date || !form.category) return;
    const newIncome = {
      name: form.name,
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      notes: form.notes,
      user_id: user?.id,
    };
    if (isLoggedIn && user?.id) {
      setLoading(true);
      const token = await getToken();
      const supabase = createClient(token || undefined);
      supabase
        .from("income")
        .insert([newIncome])
        .select()
        .then(({ data, error }) => {
          setLoading(false);
          if (!error && data && data[0]) {
            setIncome((prev) => prev ? [...prev, { ...data[0], id: String(data[0].id) }] : [{ ...data[0], id: String(data[0].id) }]);
          }
        });
    } else {
      addIncome(newIncome);
      setIncome((prev) => prev ? [...prev, { ...newIncome, id: Math.random().toString() }] : [{ ...newIncome, id: Math.random().toString() }]);
    }
    setForm({ name: "", amount: "", date: "", category: "", notes: "" });
  }

  async function handleDeleteIncome(id: string) {
    if (isLoggedIn && user?.id) {
      setLoading(true);
      const token = await getToken();
      const supabase = createClient(token || undefined);
      supabase
        .from("income")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .then(({ error }) => {
          setLoading(false);
          if (!error) setIncome((prev) => prev ? prev.filter((i) => i.id !== id) : prev);
        });
    } else {
      deleteIncome(Number(id));
      setIncome((prev) => prev ? prev.filter((i) => i.id !== id) : prev);
    }
  }

  async function handleEditIncome(id: string, updated: Income) {
    if (isLoggedIn && user?.id) {
      setLoading(true);
      const token = await getToken();
      const supabase = createClient(token || undefined);
      supabase
        .from("income")
        .update(updated)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .then(({ error }) => {
          setLoading(false);
          if (!error) setIncome((prev) => prev ? prev.map((i) => (i.id === id ? { ...i, ...updated } : i)) : prev);
        });
    } else {
      setIncome((prev) => prev ? prev.map((i) => (i.id === id ? { ...i, ...updated } : i)) : prev);
    }
  }

  function handleExportCSV() {
    const header = ["Name", "Amount", "Date", "Category", "Notes"];
    const rows = [header.join(",")];
    (income ?? []).forEach((row: any) => {
      rows.push([
        row.name,
        row.amount,
        row.date,
        row.category,
        row.notes || ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // Loading skeleton UI instead of spinner
  if ((isLoggedIn && income === null) || loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* 1. Summary Cards */}
            <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse mb-4" />
            {/* 2. Income Over Time Chart */}
            <div className="px-4 lg:px-6">
              <div className="h-48 w-full bg-muted/50 rounded-lg animate-pulse" />
            </div>
            {/* 3. Income Controls & Actions */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income Controls</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add or export all your income records.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="default" disabled> Add Income </Button>
                  <Button variant="outline" disabled> Export CSV </Button>
                </CardContent>
              </Card>
            </div>
            {/* 4. Income Table Skeleton */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logged Income</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm flex items-center gap-1">
                      <input type="checkbox" checked={false} disabled className="accent-primary" />
                      Show future income
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
          <IncomeSectionCards income={visibleIncome} />

          {/* 2. Income Over Time Chart */}
          <div className="px-4 lg:px-6">
            <IncomeChart data={income ?? []} />
          </div>

          {/* 3. Income Controls & Actions */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Controls</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Add or export all your income records.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default" disabled={loading}>Add Income</Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[350px] p-4">
                    <h3 className="text-lg font-semibold mb-2">Add a New Income</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleAddIncome}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Income source"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.name}
                        onChange={handleFormChange}
                        disabled={loading}
                      />
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount ($)"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.amount}
                        onChange={handleFormChange}
                        disabled={loading}
                      />
                      <input
                        type="date"
                        name="date"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.date}
                        onChange={handleFormChange}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.category}
                        onChange={handleFormChange}
                        disabled={loading}
                      />
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes (optional)"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.notes}
                        onChange={handleFormChange}
                        disabled={loading}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" variant="default" size="sm" disabled={loading}>
                          {loading ? "Adding..." : "Add Income"}
                        </Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={handleExportCSV} disabled={loading}>Export CSV</Button>
              </CardContent>
            </Card>
          </div>

          {/* 4. Income Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Logged Income</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={showFuture}
                      onChange={e => setShowFuture(e.target.checked)}
                      className="accent-primary"
                      disabled={loading}
                    />
                    Show future income
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <IncomeDataTable
                  data={(visibleIncome ?? []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                  onEditIncome={handleEditIncome}
                  onDeleteIncome={handleDeleteIncome}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
