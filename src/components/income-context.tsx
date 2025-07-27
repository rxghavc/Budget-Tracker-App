"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import incomeRaw from "@/app/income/income.json";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";

interface Income {
  id?: string; // uuid from Supabase or string for local
  user_id?: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface IncomeContextType {
  incomeList: Income[];
  addIncome: (income: Income) => void;
  deleteIncome: (idx: number) => void;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export function useIncome() {
  const ctx = useContext(IncomeContext);
  if (!ctx) throw new Error("useIncome must be used within an IncomeProvider");
  return ctx;
}

export function IncomeProvider({ children }: { children: ReactNode }) {
  // Patch local data to have string ids for compatibility
  const incomeRawPatched = (incomeRaw as any[]).map((item, idx) => ({
    ...item,
    id: item.id ? String(item.id) : Math.random().toString(),
  }));

  const [incomeList, setIncomeList] = useState<Income[]>(incomeRawPatched);
  const { user } = useUser();
  const isLoggedIn = !!user;
  const { getToken } = useClerkAuth() as any; // getToken from Clerk

  const addIncome = async (income: Income) => {
    if (isLoggedIn && user) {
      const token = await getToken();
      const supabase = createClient(token || undefined);
      const { data, error } = await supabase.from("income").insert([{
        ...income,
        user_id: user.id,
      }]);
      if (!error) setIncomeList((prev) => [income, ...prev]);
    } else {
      setIncomeList((prev) => [income, ...prev]);
    }
  };
  const deleteIncome = async (idx: number) => {
    if (isLoggedIn && user) {
      const token = await getToken?.({ template: "supabase" });
      const supabase = createClient(token);
      const id = incomeList[idx]?.id;
      if (id !== undefined) {
        const { error } = await supabase.from("income").delete().eq("id", id);
        if (!error) setIncomeList((prev) => prev.filter((_, i) => i !== idx));
      }
    } else {
      setIncomeList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <IncomeContext.Provider value={{ incomeList, addIncome, deleteIncome }}>
      {children}
    </IncomeContext.Provider>
  );
}
