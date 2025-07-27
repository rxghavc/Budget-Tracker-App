"use client";

import { useCurrency, CURRENCY_OPTIONS } from "@/components/currency-context";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/auth-context";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { isLoggedIn, user } = useAuth();
  const userProfileDialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  // On mount, fetch user currency from Supabase if logged in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      const supabase = createClient();
      supabase
        .from("user_settings")
        .select("currency_code, currency_symbol")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            const found = CURRENCY_OPTIONS.find(
              (c) => c.code === data.currency_code
            );
            if (found) setCurrency(found);
            else
              setCurrency({
                code: data.currency_code,
                symbol: data.currency_symbol,
              });
          }
        });
    }
    // eslint-disable-next-line
  }, [isLoggedIn, user?.id]);

  async function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected =
      CURRENCY_OPTIONS.find((c) => c.code === e.target.value) ||
      CURRENCY_OPTIONS[0];
    setCurrency(selected);
    if (isLoggedIn && user?.id) {
      const supabase = createClient();
      // Upsert user_settings
      await supabase.from("user_settings").upsert({
        user_id: user.id,
        currency_code: selected.code,
        currency_symbol: selected.symbol,
      });
    }
  }
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="mb-6">
        <label htmlFor="currency" className="block text-sm font-medium mb-2">
          Currency
        </label>
        <select
          id="currency"
          value={currency.code}
          onChange={handleCurrencyChange}
          className="border rounded px-3 py-2 text-sm w-full"
        >
          {CURRENCY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">
          This will update the currency symbol across the app.
        </p>
      </div>
      <div className="mt-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setOpen(true)}
            >
              Profile Controls
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full p-0 bg-transparent shadow-none flex justify-center items-center">
            <UserProfile
              appearance={{
                elements: {
                  card: "w-full min-h-[600px] max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-border",
                  rootBox: "w-full",
                },
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-10">
        <p className="text-xs text-muted-foreground mt-2 pb-5">
          Have suggestions or found a bug? Let us know!
        </p>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-4 py-2 text-sm transition-colors"
          onClick={() =>
            window.open(
              "mailto:rxghavcdev@gmail.com?subject=Budget%20Tracker%20Feedback",
              "_blank"
            )
          }
        >
          Send Feedback
        </button>
      </div>
      <div className="mt-12 text-center text-xs text-muted-foreground">
        App version: 1.0.0
      </div>
    </div>
  );
}