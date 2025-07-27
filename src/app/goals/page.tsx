"use client";

import { GoalsSectionCards } from "@/components/goals-section-cards";
import goalsRaw from "./goals.json";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GoalsDataTable } from "@/components/goals-data-table";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from "@/components/currency-context";
import { useUser, useAuth } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";

interface Goal {
  id?: string; // uuid from Supabase
  user_id?: string; // user id for per-user goals
  name: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

const goals: Goal[] = goalsRaw as Goal[];

export default function GoalsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const isLoggedIn = !!user;
  const [filter, setFilter] = useState("");
  // Initialize as null to avoid flash of static data
  const [goalList, setGoalList] = useState<Goal[] | null>(null);
  const [loading, setLoading] = useState(false);
  // Add goal form state
  const [form, setForm] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    category: "",
  });
  // For edit popover
  const [selectedEditGoalIdx, setSelectedEditGoalIdx] = useState<number | null>(null);
  const [editPopoverOpen, setEditPopoverOpen] = useState(false);
  const [editPopoverForm, setEditPopoverForm] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    category: "",
  });
  const { currency } = useCurrency();

  // Filtered goals (from local state)
  const filteredGoals = useMemo(
    () =>
      (goalList ?? []).filter(
        (g) =>
          g.name.toLowerCase().includes(filter.toLowerCase()) ||
          g.category.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, goalList]
  );

  // Fetch goals from Supabase on login
  useEffect(() => {
    async function fetchGoals() {
      if (!userLoaded || !authLoaded) return;
      if (!isLoggedIn) {
        setGoalList(goals); // Only set static data if definitely not logged in
        setLoading(false);
        return;
      }
      setLoading(true);
      const accessToken = await getToken();
      const supabase = createClient(accessToken || undefined);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);
      setLoading(false);
      if (data) setGoalList(data);
    }
    fetchGoals();
  }, [isLoggedIn, user?.id, userLoaded, authLoaded]);

  // Handle form input
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle edit popover form input
  function handleEditPopoverFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditPopoverForm({ ...editPopoverForm, [e.target.name]: e.target.value });
  }

  // Add goal
  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.target || !form.current || !form.deadline || !form.category) return;
    const newGoal = {
      name: form.name,
      target: Number(form.target),
      current: Number(form.current),
      deadline: form.deadline,
      category: form.category,
      user_id: user?.id,
    };
    if (isLoggedIn && user?.id) {
      setLoading(true);
      const accessToken = await getToken();
      const supabase = createClient(accessToken || undefined);
      const { data, error } = await supabase
        .from("goals")
        .insert([newGoal])
        .select();
      setLoading(false);
      if (!error && data && data[0]) {
        setGoalList((prev) => (prev ? [...prev, { ...data[0], id: String(data[0].id) }] : [{ ...data[0], id: String(data[0].id) }]));
      }
    } else {
      setGoalList((prev) => (prev ? [...prev, { ...newGoal, id: Math.random().toString() }] : [{ ...newGoal, id: Math.random().toString() }]));
    }
    setForm({ name: "", target: "", current: "", deadline: "", category: "" });
  }

  // Update edit popover form when dropdown changes
  function handleEditDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const idx = e.target.value === "" ? null : Number(e.target.value);
    setSelectedEditGoalIdx(idx);
    if (idx !== null && goalList) {
      const g = goalList[idx];
      setEditPopoverForm({
        name: g.name,
        target: g.target.toString(),
        current: g.current.toString(),
        deadline: g.deadline,
        category: g.category,
      });
    }
  }

  // Open popover for selected goal
  function handleOpenEditPopover() {
    setEditPopoverOpen(true);
  }

  // Save edit from popover (reuse existing logic, but update for selectedEditGoalIdx)
  async function handleEditPopoverSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPopoverForm.name || !editPopoverForm.target || !editPopoverForm.current || !editPopoverForm.deadline || !editPopoverForm.category) return;
    const updatedGoal = {
      name: editPopoverForm.name,
      target: Number(editPopoverForm.target),
      current: Number(editPopoverForm.current),
      deadline: editPopoverForm.deadline,
      category: editPopoverForm.category,
    };
    if (isLoggedIn && selectedEditGoalIdx !== null && goalList) {
      const old = goalList[selectedEditGoalIdx];
      if (old.id) {
        setLoading(true);
        const accessToken = await getToken();
        const supabase = createClient(accessToken || undefined);
        const { error } = await supabase.from("goals").update(updatedGoal).eq("id", old.id).select();
        setLoading(false);
        if (!error) setGoalList((prev) => prev ? prev.map((g, i) => (i === selectedEditGoalIdx ? { ...old, ...updatedGoal } : g)) : prev);
      }
    } else if (goalList) {
      setGoalList((prev) => prev ? prev.map((g, i) => (i === selectedEditGoalIdx ? { ...g, ...updatedGoal } : g)) : prev);
    }
    setEditPopoverOpen(false);
    setSelectedEditGoalIdx(null);
  }

  // Delete goal
  async function handleDeleteGoal(idx: number) {
    if (isLoggedIn && goalList) {
      const old = goalList[idx];
      if (old.id) {
        setLoading(true);
        const accessToken = await getToken();
        const supabase = createClient(accessToken || undefined);
        const { error } = await supabase.from("goals").delete().eq("id", old.id);
        setLoading(false);
        if (!error) setGoalList((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
      }
    } else if (goalList) {
      setGoalList((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
    }
    if (selectedEditGoalIdx === idx) setSelectedEditGoalIdx(null);
  }

  // Skeleton UI instead of spinner
  if ((isLoggedIn && goalList === null) || loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* 1. Summary Cards Skeleton */}
            <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse mb-4" />
            {/* 2. Goals Table Skeleton */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Active Goals</CardTitle>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-600 inline-block border border-green-700" />
                      <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-orange-600" />
                      <span className="w-3 h-3 rounded-full bg-gray-400 inline-block border border-gray-500" />
                      <span className="sr-only">Legend</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Filter by name or category..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mt-2 w-full max-w-xs rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled
                  />
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
            {/* 3. Goals Controls & Actions Skeleton */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Controls</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">Easily add new goals, update your progress, or remove goals as you achieve them.</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 items-center">
                  <Button variant="default" disabled>Add Goal</Button>
                  <select className="border rounded px-2 py-1 text-sm min-w-[120px]" disabled>
                    <option>Edit goal...</option>
                  </select>
                  <Button variant="outline" disabled>Edit</Button>
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
          <GoalsSectionCards goals={(goalList ?? []).map(g => ({ ...g, id: g.id !== undefined ? String(g.id) : undefined }))} />

          {/* 2. Goals Table */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Active Goals</CardTitle>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-600 inline-block border border-green-700" />
                    <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-orange-600" />
                    <span className="w-3 h-3 rounded-full bg-gray-400 inline-block border border-gray-500" />
                    <span className="sr-only">Legend</span>
                    <span className="ml-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-muted-foreground cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="w-3 h-3 rounded-full bg-green-600 inline-block border border-green-700" />
                            <span>Goal complete</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-orange-600" />
                            <span>Deadline passed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-gray-400 inline-block border border-gray-500" />
                            <span>In progress</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Filter by name or category..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-2 w-full max-w-xs rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </CardHeader>
              <CardContent>
                <GoalsDataTable
                  data={filteredGoals.map(g => ({ ...g, id: g.id !== undefined ? String(g.id) : undefined }))}
                  onDeleteGoal={handleDeleteGoal}
                />
              </CardContent>
            </Card>
          </div>

          {/* 2. Goals Controls & Actions */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Controls</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Easily add new goals, update your progress, or remove goals as you achieve them.</p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="default">Add Goal</Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[350px] p-4">
                    <h3 className="text-lg font-semibold mb-2">Add a New Goal</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleGoalSubmit}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Goal name"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.name}
                        onChange={handleFormChange}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="target"
                          placeholder="Target amount"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={form.target}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="current"
                          placeholder="Current saved"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={form.current}
                          onChange={handleFormChange}
                        />
                      </div>
                      <input
                        type="date"
                        name="deadline"
                        className="border rounded px-2 py-1 text-sm"
                        value={form.deadline}
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
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" variant="default" size="sm" disabled={loading}>
                          {loading ? "Adding..." : "Add Goal"}
                        </Button>
                      </div>
                    </form>
                  </PopoverContent>
                </Popover>
                {/* Edit Goal Dropdown and Popover */}
                <select
                  className="border rounded px-2 py-1 text-sm min-w-[120px]"
                  value={selectedEditGoalIdx ?? ""}
                  onChange={handleEditDropdownChange}
                  disabled={!goalList}
                >
                  <option value="">Edit goal...</option>
                  {(goalList ?? []).map((g, idx) => (
                    <option key={g.name + idx} value={idx}>{g.name}</option>
                  ))}
                </select>
                <Popover open={editPopoverOpen} onOpenChange={setEditPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={selectedEditGoalIdx === null || !goalList}
                      onClick={handleOpenEditPopover}
                    >
                      Edit
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[350px] p-4">
                    <h3 className="text-lg font-semibold mb-2">Edit Goal</h3>
                    <form className="flex flex-col gap-3" onSubmit={handleEditPopoverSubmit}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Goal name"
                        className="border rounded px-2 py-1 text-sm"
                        value={editPopoverForm.name}
                        onChange={handleEditPopoverFormChange}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="target"
                          placeholder="Target amount"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={editPopoverForm.target}
                          onChange={handleEditPopoverFormChange}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{currency.symbol}</span>
                        <input
                          type="number"
                          name="current"
                          placeholder="Current saved"
                          className="border rounded px-2 py-1 text-sm flex-1"
                          value={editPopoverForm.current}
                          onChange={handleEditPopoverFormChange}
                        />
                      </div>
                      <input
                        type="date"
                        name="deadline"
                        className="border rounded px-2 py-1 text-sm"
                        value={editPopoverForm.deadline}
                        onChange={handleEditPopoverFormChange}
                      />
                      <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        className="border rounded px-2 py-1 text-sm"
                        value={editPopoverForm.category}
                        onChange={handleEditPopoverFormChange}
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
        </div>
      </div>
    </div>
  );
}
