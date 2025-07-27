"use client";

import { BudgetSectionCards } from "@/components/budget-section-cards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { useState, useEffect } from "react";
import { useCurrency } from "@/components/currency-context";
import { useExpenses } from "@/components/expenses-context";
import { useAuth } from "@/components/auth-context";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";
import budgetDataRaw from "./budgets.json";
import expensesRaw from "../expenses/expenses.json";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type BudgetCategory = {
	id?: string; // uuid from Supabase
	user_id?: string;
	category: string;
	value: number;
	color: string;
};

const budgetData = budgetDataRaw as BudgetCategory[];

export default function BudgetsPage() {
	const { isLoggedIn, user } = useAuth();
	const { getToken } = useClerkAuth();
	const { currency } = useCurrency();
	const { expensesList } = useExpenses();
	// Initialize as null to avoid flash of static data
	const [budgets, setBudgets] = useState<BudgetCategory[] | null>(null);
	const [expenses, setExpenses] = useState<{ name: string; category: string; amount: number; date: string; notes?: string }[] | null>(null);
	const [showAdd, setShowAdd] = useState(false);
	const [addForm, setAddForm] = useState({ category: "", value: "", color: "#0ea5e9" });
	const [editIdx, setEditIdx] = useState<number | null>(null);
	const [editForm, setEditForm] = useState({ category: "", value: "", color: "#0ea5e9" });
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isLoggedIn === false) {
			setBudgets(budgetData);
			setExpenses(expensesRaw);
			setLoading(false);
		} else if (isLoggedIn && user?.id) {
			setLoading(true);
			(async () => {
				const token = await getToken();
				const supabase = createClient(token || undefined);
				supabase.from("budgets").select("*").eq("user_id", user.id).then((res) => {
					if (res.data) setBudgets(res.data);
				});
				supabase.from("expenses").select("*").eq("user_id", user.id).then((res) => {
					if (res.data) setExpenses(res.data);
					setLoading(false);
				});
			})();
		} else {
			setBudgets(null);
			setExpenses(null);
			setLoading(true);
		}
	}, [isLoggedIn, user?.id]);

	// Update section cards and chart by using budgets state
	const overBudget = budgets ? budgets.filter((b) => b.category === "Rent") : [];

	// Handle add
	async function handleAddBudget(e: React.FormEvent) {
		e.preventDefault();
		if (!addForm.category || !addForm.value) return;
		const newBudget = { category: addForm.category, value: Number(addForm.value), color: addForm.color, user_id: user?.id };
		if (isLoggedIn && user?.id) {
			setLoading(true);
			const token = await getToken();
			const supabase = createClient(token || undefined);
			const { data, error } = await supabase.from("budgets").insert([newBudget]).select();
			setLoading(false);
			if (!error && data && data[0]) setBudgets((prev) => [data[0], ...(prev ?? [])]);
		} else {
			setBudgets((prev) => [newBudget, ...(prev ?? [])]);
		}
		setAddForm({ category: "", value: "", color: "#0ea5e9" });
		setShowAdd(false);
	}

	// Handle edit
	function handleEditBudget(idx: number) {
		if (!budgets) return;
		const b = budgets[idx];
		setEditForm({ category: b.category, value: b.value.toString(), color: b.color });
		setEditIdx(idx);
	}
	async function handleEditBudgetSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (editIdx === null || !budgets) return;
		const old = budgets[editIdx];
		const updated = { category: editForm.category, value: Number(editForm.value), color: editForm.color };
		if (isLoggedIn && old.id && user?.id) {
			setLoading(true);
			const token = await getToken();
			const supabase = createClient(token || undefined);
			const { error } = await supabase.from("budgets").update(updated).eq("id", old.id).eq("user_id", user.id).select();
			setLoading(false);
			if (!error) setBudgets((prev) => prev ? prev.map((b, i) => (i === editIdx ? { ...old, ...updated } : b)) : prev);
		} else {
			setBudgets((prev) => prev ? prev.map((b, i) => (i === editIdx ? { ...b, ...updated } : b)) : prev);
		}
		setEditIdx(null);
	}
	async function handleDeleteBudget(idx: number) {
		if (!budgets) return;
		const old = budgets[idx];
		if (isLoggedIn && old.id && user?.id) {
			setLoading(true);
			const token = await getToken();
			const supabase = createClient(token || undefined);
			const { error } = await supabase.from("budgets").delete().eq("id", old.id).eq("user_id", user.id);
			setLoading(false);
			if (!error) setBudgets((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
		} else {
			setBudgets((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
		}
	}

	function getSpentForCategory(category: string) {
		if (!category) return 0;
		const now = new Date();
		const month = now.getMonth();
		const year = now.getFullYear();
		return expensesList
			.filter(e => {
				if (e.category.toLowerCase() !== category.toLowerCase()) return false;
				const d = new Date(e.date);
				return d.getMonth() === month && d.getFullYear() === year && d <= now;
			})
			.reduce((sum, e) => sum + e.amount, 0);
	}

	// Helper for Add Budget popover to get spent for category from correct expenses state
	function getSpentForCategoryAddPopover(category: string) {
		if (!category || !expenses) return 0;
		const now = new Date();
		const month = now.getMonth();
		const year = now.getFullYear();
		return expenses
			.filter(e => {
				if (e.category.toLowerCase() !== category.toLowerCase()) return false;
				const d = new Date(e.date);
				return d.getMonth() === month && d.getFullYear() === year && d <= now;
			})
			.reduce((sum, e) => sum + e.amount, 0);
	}

	// Helper for Budgets by Category table to get spent for category from correct expenses state
	function getSpentForCategoryTable(category: string) {
		if (!category || !expenses) return 0;
		const now = new Date();
		const month = now.getMonth();
		const year = now.getFullYear();
		return expenses
			.filter(e => {
				if (e.category.toLowerCase() !== category.toLowerCase()) return false;
				const d = new Date(e.date);
				return d.getMonth() === month && d.getFullYear() === year && d <= now;
			})
			.reduce((sum, e) => sum + e.amount, 0);
	}

	// Color palette for quick selection
	const colorPalette = [
		"#0ea5e9", // blue
		"#f59e42", // orange
		"#f43f5e", // red
		"#22c55e", // green
		"#a855f7", // purple
		"#eab308", // yellow
		"#64748b", // slate
		"#14b8a6", // teal
		"#f472b6", // pink
	];

	// Skeleton UI while loading or not loaded for logged-in users
	if ((isLoggedIn && (budgets === null || expenses === null || loading))) {
		return (
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						{/* 1. Summary Cards Skeleton */}
						<div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse mb-4" />
						{/* 2. Budget Allocation Pie Chart Skeleton */}
						<div className="px-4 lg:px-6">
							<div className="h-72 w-full bg-muted/50 rounded-lg animate-pulse" />
						</div>
						{/* 3. Budget Controls & Actions Skeleton */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<CardTitle>Budget Controls</CardTitle>
									<p className="text-muted-foreground text-sm mt-1">Manage your budget categories and export your data.</p>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2">
									<Button variant="default" disabled>Add Budget</Button>
								</CardContent>
							</Card>
						</div>
						{/* 4. Budget Category Table Skeleton */}
						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader>
									<CardTitle>Budgets by Category</CardTitle>
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
					<BudgetSectionCards budgets={budgets ?? []} expenses={expenses ?? []} />
					{/* 1. Budget Allocation Pie Chart */}
					<div className="px-4 lg:px-6">
						<Card>
							<CardHeader>
								<CardTitle>Budget Allocation by Category</CardTitle>
							</CardHeader>
							<CardContent className="h-72 flex items-center justify-center">
								<ResponsiveContainer width="100%" height={250}>
									<PieChart>
										<Pie
											data={budgets ?? []}
											dataKey="value"
											nameKey="category"
											cx="50%"
											cy="50%"
											outerRadius={80}
											label={({ name, value }) => `${name}: ${currency.symbol}${value.toLocaleString()}`}
										>
											{(budgets ?? []).map((entry, idx) => (
												<Cell key={`cell-${idx}`} fill={entry.color} />
											))}
										</Pie>
										<RechartsTooltip formatter={(value) => `${currency.symbol}${value.toLocaleString()}`} />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>

					{/* 2. Budget Controls & Actions */}
					<div className="px-4 lg:px-6">
						<Card>
							<CardHeader>
								<CardTitle>Budget Controls</CardTitle>
								<p className="text-muted-foreground text-sm mt-1">Manage your budget categories and export your data.</p>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								<Popover open={showAdd} onOpenChange={setShowAdd}>
									<PopoverTrigger asChild>
										<Button variant="default">Add Budget</Button>
									</PopoverTrigger>
									<PopoverContent align="start" className="w-80">
										<form onSubmit={handleAddBudget} className="space-y-3">
											<input
												type="text"
												placeholder="Category"
												className="border rounded px-2 py-1 w-full"
												value={addForm.category}
												onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
												required
											/>
											<div className="flex items-center gap-1">
												<span className="text-muted-foreground">{currency.symbol}</span>
												<input
													type="number"
													placeholder="Amount"
													className="border rounded px-2 py-1 w-full"
													value={addForm.value}
													onChange={e => setAddForm(f => ({ ...f, value: e.target.value }))}
													required
												/>
											</div>
											{/* Show spent for this category if it already exists */}
											{(() => {
												const spent = getSpentForCategoryAddPopover(addForm.category);
												if (addForm.category && spent > 0) {
													return (
														<div className="text-xs text-muted-foreground">
															Spent so far: <span className="font-semibold">{currency.symbol}{spent.toLocaleString()}</span>
														</div>
													);
												}
												return null;
											})()}
											<div>
												<label className="block text-xs mb-1">Color</label>
												<div className="flex gap-1 mb-2 flex-wrap">
													{colorPalette.map((color) => (
														<button
															type="button"
															key={color}
															className={`w-6 h-6 rounded-full border-2 ${addForm.color === color ? 'border-black dark:border-white' : 'border-transparent'}`}
															style={{ backgroundColor: color }}
															onClick={() => setAddForm(f => ({ ...f, color }))}
															aria-label={`Choose color ${color}`}
														/>
													))}
													{/* Custom color input at the end */}
													<input type="color" className="w-8 h-8 p-0 border rounded ml-2" value={addForm.color} onChange={e => setAddForm(f => ({ ...f, color: e.target.value }))} />
												</div>
											</div>
											<Button type="submit" variant="default" size="sm" className="w-full mt-2">Add</Button>
										</form>
									</PopoverContent>
								</Popover>
							</CardContent>
						</Card>
					</div>

					{/* 3. Budget Category Table */}
					<div className="px-4 lg:px-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									Budgets by Category
									<span className="relative group">
										<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle text-muted-foreground cursor-pointer"><circle cx="12" cy="12" r="10" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="12" fill="currentColor">i</text></svg>
										<span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded bg-background px-3 py-2 text-xs text-foreground shadow-lg group-hover:block border border-border top-6">
											The Spent column updates automatically based on your recorded expenses for each category.
										</span>
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="py-2 text-left">Category</th>
											<th className="py-2 text-right">Budgeted</th>
											<th className="py-2 text-right">Spent</th>
											<th className="py-2 text-right">Remaining</th>
											<th className="py-2 text-right">Utilization</th>
											<th className="py-2 text-right">Actions</th>
										</tr>
									</thead>
									<tbody>
										{budgets && budgets.map((b, idx) => {
											const spent = getSpentForCategoryTable(b.category);
											const remaining = b.value - spent;
											const percent = b.value === 0 ? 0 : Math.min(100, Math.round((spent / b.value) * 100));
											return (
												<tr key={b.category} className="border-b last:border-0">
													<td className="py-2 font-medium flex items-center gap-2">
														{b.category}
														{percent >= 100 && <Badge variant="destructive">Over</Badge>}
													</td>
													<td className="py-2 text-right">{currency.symbol}{b.value.toLocaleString()}</td>
													<td className="py-2 text-right">{currency.symbol}{spent.toLocaleString()}</td>
													<td className={`py-2 text-right ${remaining < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{remaining > 0 ? `+${currency.symbol}${remaining.toLocaleString()}` : `${currency.symbol}${remaining.toLocaleString()}`}</td>
													<td className="py-2 text-right">
														<span className={percent >= 100 ? "text-red-600 dark:text-red-400 font-semibold" : "font-medium"}>{percent}%</span>
													</td>
													<td className="py-2 text-right">
														<div className="flex gap-2 justify-end">
															<Popover open={editIdx === idx} onOpenChange={open => setEditIdx(open ? idx : null)}>
																<PopoverTrigger asChild>
																	<Button
																		variant="outline"
																		size="sm"
																		className="p-1.5 h-7 w-7 flex items-center justify-center"
																		onClick={() => handleEditBudget(idx)}
																		aria-label="Edit budget"
																	>
																		<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6 6M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L4.293 13.293A1 1 0 004 14v4z" /></svg>
																	</Button>
																</PopoverTrigger>
																<PopoverContent align="start" className="w-80">
																	<form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleEditBudgetSubmit(e)} className="space-y-3">
																		<input
																			type="text"
																			placeholder="Category"
																			className="border rounded px-2 py-1 w-full"
																			value={editForm.category}
																			onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
																			required
																		/>
																		<div className="flex items-center gap-1">
																			<span className="text-muted-foreground">{currency.symbol}</span>
																			<input
																				type="number"
																				placeholder="Amount"
																				className="border rounded px-2 py-1 w-full"
																				value={editForm.value}
																				onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))}
																				required
																			/>
																		</div>
																		{/* Show spent for this category */}
																		{(() => {
																			const spentEdit = getSpentForCategoryTable(editForm.category);
																			if (editForm.category && spentEdit > 0) {
																				return (
																					<div className="text-xs text-muted-foreground">
																						Spent so far: <span className="font-semibold">{currency.symbol}{spentEdit.toLocaleString()}</span>
																					</div>
																				);
																			}
																			return null;
																		})()}
																		<div>
																			<label className="block text-xs mb-1">Color</label>
																			<div className="flex gap-1 mb-2 flex-wrap">
																				{colorPalette.map((color) => (
																					<button
																						type="button"
																						key={color}
																						className={`w-6 h-6 rounded-full border-2 ${editForm.color === color ? 'border-black dark:border-white' : 'border-transparent'}`}
																						style={{ backgroundColor: color }}
																						onClick={() => setEditForm(f => ({ ...f, color }))}
																						aria-label={`Choose color ${color}`}
																					/>
																				))}
																				{/* Custom color input at the end */}
																				<input type="color" className="w-8 h-8 p-0 border rounded ml-2" value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} />
																			</div>
																		</div>
																		<Button type="submit" variant="default" size="sm" className="w-full mt-2">Save</Button>
																	</form>
																</PopoverContent>
															</Popover>
															<Button
																variant="destructive"
																size="sm"
																className="p-1.5 h-7 w-7 flex items-center justify-center"
																onClick={() => handleDeleteBudget(idx)}
																aria-label="Delete budget"
															>
																<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10" /></svg>
															</Button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
