"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import expensesRaw from "@/app/expenses/expenses.json";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";

export interface Expense {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

interface ExpensesContextType {
  expensesList: Expense[];
  addExpense: (expense: Expense) => void;
  editExpense: (idx: number, updated: Expense) => void;
  deleteExpense: (idx: number) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expensesList, setExpensesList] = useState<Expense[]>(expensesRaw as Expense[]);
  const { user } = useUser();
  const isLoggedIn = !!user;
  const { getToken } = useClerkAuth() as any; // getToken from Clerk

  const addExpense = async (expense: Expense) => {
    console.log('addExpense called', expense);
    if (isLoggedIn && user) {
      const token = await getToken();
      console.log('Clerk JWT token:', token); // Log the token for debugging
      const supabase = createClient(token || undefined);
      const { data, error } = await supabase.from("expenses").insert([{
        ...expense,
        user_id: user.id,
      }]);
      if (!error) setExpensesList((prev) => [expense, ...prev]);
    } else {
      setExpensesList((prev) => [expense, ...prev]);
    }
  };
  const editExpense = async (idx: number, updated: Expense) => {
    if (isLoggedIn && user) {
      const token = await getToken();
      const supabase = createClient(token || undefined);
      const { error } = await supabase.from("expenses").update(updated).eq("id", updated.id);
      if (!error) setExpensesList((prev) => prev.map((e, i) => i === idx ? updated : e));
    } else {
      setExpensesList((prev) => prev.map((e, i) => i === idx ? updated : e));
    }
  };
  const deleteExpense = async (idx: number) => {
    if (isLoggedIn && user) {
      const token = await getToken();
      const supabase = createClient(token || undefined);
      const id = expensesList[idx]?.id;
      if (id !== undefined) {
        const { error } = await supabase.from("expenses").delete().eq("id", id);
        if (!error) setExpensesList((prev) => prev.filter((_, i) => i !== idx));
      }
    } else {
      setExpensesList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <ExpensesContext.Provider value={{ expensesList, addExpense, editExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
}
