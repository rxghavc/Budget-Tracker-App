"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@/utils/supabase/client";

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
];

const DEFAULT_CURRENCY = CURRENCY_OPTIONS[0];

interface CurrencyContextType {
  currency: { code: string; symbol: string };
  setCurrency: (currency: { code: string; symbol: string }) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const isLoggedIn = !!user;
  const { getToken } = useClerkAuth();
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    async function fetchCurrency() {
      if (isLoggedIn && user) {
        const token = await getToken();
        const supabase = createClient(token || undefined);
        const { data, error } = await supabase
          .from("user_settings")
          .select("currency_code, currency_symbol")
          .eq("user_id", user.id)
          .single();
        if (!error && data && data.currency_code && data.currency_symbol) {
          setCurrencyState({ code: data.currency_code, symbol: data.currency_symbol });
          localStorage.setItem("currency", JSON.stringify({ code: data.currency_code, symbol: data.currency_symbol }));
          return;
        }
      }
      // fallback to localStorage
      const stored = localStorage.getItem("currency");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.code && parsed.symbol) setCurrencyState(parsed);
        } catch {}
      }
    }
    fetchCurrency();
    // eslint-disable-next-line
  }, [isLoggedIn, user]);

  const setCurrency = async (currency: { code: string; symbol: string }) => {
    setCurrencyState(currency);
    localStorage.setItem("currency", JSON.stringify(currency));
    if (isLoggedIn && user) {
      const token = await getToken();
      const supabase = createClient(token || undefined);
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        currency_code: currency.code,
        currency_symbol: currency.symbol,
      }, { onConflict: "user_id" });
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export { CURRENCY_OPTIONS };
