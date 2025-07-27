import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { CurrencyProvider } from "@/components/currency-context";
import { IncomeProvider } from "@/components/income-context";
import { ExpensesProvider } from "@/components/expenses-context";
import { SyncClerkUserToSupabase } from "@/components/sync-clerk-user";
import { AuthProvider } from "@/components/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgetly – Personal Finance Tracker",
  description: "Track your budgets, expenses, and financial goals with Budgetly.",
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg%20fill%3D%22%230ea5e9%22%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M200%2C120a16%2C16%2C0%2C1%2C1-16-16A16%2C16%2C0%2C0%2C1%2C200%2C120ZM156%2C64H116a12%2C12%2C0%2C0%2C0%2C0%2C24h40a12%2C12%2C0%2C0%2C0%2C0-24Zm100%2C48v32a28%2C28%2C0%2C0%2C1-27.54%2C28L213.2%2C214.73A20%2C20%2C0%2C0%2C1%2C194.36%2C228H181.64a20%2C20%2C0%2C0%2C1-18.84-13.27l-1-2.73H110.17l-1%2C2.73A20%2C20%2C0%2C0%2C1%2C90.36%2C228H77.64A20%2C20%2C0%2C0%2C1%2C58.8%2C214.73L46.5%2C180.28A91.63%2C91.63%2C0%2C0%2C1%2C25.75%2C137.8%2C11.91%2C11.91%2C0%2C0%2C0%2C24%2C144a12%2C12%2C0%2C0%2C1-24%2C0%2C36.07%2C36.07%2C0%2C0%2C1%2C24.56-34.13A92.13%2C92.13%2C0%2C0%2C1%2C116%2C28H220a12%2C12%2C0%2C0%2C1%2C0%2C24H210a92%2C92%2C0%2C0%2C1%2C22.48%2C31.45l.42%2C1A28.05%2C28.05%2C0%2C0%2C1%2C256%2C112Zm-24%2C0a4%2C4%2C0%2C0%2C0-4-4h-3.66a12%2C12%2C0%2C0%2C1-11.45-8.41A68%2C68%2C0%2C0%2C0%2C148%2C52H116A68%2C68%2C0%2C0%2C0%2C65.86%2C165.94%2C11.85%2C11.85%2C0%2C0%2C1%2C68.31%2C170l12.15%2C34h7.08l2.87-8a12%2C12%2C0%2C0%2C1%2C11.3-8h68.58a12%2C12%2C0%2C0%2C1%2C11.3%2C8l2.87%2C8h7.08l17.16-48a12%2C12%2C0%2C0%2C1%2C11.3-8h8a4%2C4%2C0%2C0%2C0%2C4-4Z%22/%3E%3C/svg%3E"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <SyncClerkUserToSupabase />
      <AuthProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <CurrencyProvider>
              <IncomeProvider>
                <ExpensesProvider>
                  <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                      <SiteHeader />
                      <main className="flex-1">{children}</main>
                    </SidebarInset>
                  </SidebarProvider>
                </ExpensesProvider>
              </IncomeProvider>
            </CurrencyProvider>
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  );
}
