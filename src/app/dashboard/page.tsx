"use client";

import { useEffect, useState } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/utils/supabase/client";
import expensesRaw from "../expenses/expenses.json";
import incomeRaw from "../income/income.json";

export default function Page() {
  const { isLoggedIn, user } = useAuth();
  // Initialize as null to avoid flash of static data
  const [expenses, setExpenses] = useState<any[] | null>(null);
  const [income, setIncome] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn === false) {
      setExpenses(expensesRaw as any[]);
      setIncome(incomeRaw as any[]);
      setLoading(false);
    } else if (isLoggedIn && user?.id) {
      setLoading(true);
      const supabase = createClient();
      supabase.from("expenses").select("*").eq("user_id", user.id).then((res) => {
        if (res.data) setExpenses(res.data);
      });
      supabase.from("income").select("*").eq("user_id", user.id).then((res) => {
        if (res.data) setIncome(res.data);
        setLoading(false);
      });
    } else {
      setExpenses(null);
      setIncome(null);
      setLoading(true);
    }
  }, [isLoggedIn, user?.id]);

  // Skeleton UI while loading or not loaded for logged-in users
  if ((isLoggedIn && (expenses === null || income === null || loading))) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* SectionCards Skeleton */}
            <div className="h-24 w-full bg-muted/50 rounded-lg animate-pulse mb-4" />
            {/* Chart Skeleton */}
            <div className="px-4 lg:px-6">
              <div className="h-72 w-full bg-muted/50 rounded-lg animate-pulse" />
            </div>
            <div className="px-4 lg:px-6 flex flex-col items-center">
              <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground shadow animate-pulse">
                Loading your dashboard...
              </div>
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
          {/* SectionCards now uses dashboard state data */}
          <SectionCards expensesList={expenses ?? []} incomeList={income ?? []} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive expensesList={expenses ?? []} incomeList={income ?? []} />
          </div>
          <div className="px-4 lg:px-6 flex flex-col items-center">
            <div className="rounded-xl border bg-white/80 dark:bg-slate-900/80 p-8 text-center text-muted-foreground shadow-lg flex flex-col items-center gap-3 max-w-2xl w-full backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 dark:text-emerald-400">
                  <rect x="3" y="13" width="4" height="8" rx="1.5" />
                  <rect x="9.5" y="9" width="5" height="12" rx="1.5" />
                  <rect x="17" y="5" width="4" height="16" rx="1.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Welcome to Your Budgeting Hub</h2>
              <p className="text-base text-muted-foreground mb-2">
                Use the sidebar to view your budgets, track expenses, add income, or set savings goals - all in one place. <br />
                <span className="inline-block mt-2 text-sm text-foreground/70">Get started by exploring the sections on the left!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
