import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiPiggyBankBold } from "react-icons/pi";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Personal Finance Dashboard</title>
        <meta
          name="description"
          content="Take control of your money with a modern, privacy-friendly budgeting app. Track expenses, set budgets, and visualize your financial health—all in one place."
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%230ea5e9'/%3E%3Cpath d='M10 25 Q15 10 30 20 Q25 30 10 25 Z' fill='%23fff'/%3E%3Cellipse cx='27' cy='19' rx='1.5' ry='2' fill='%230ea5e9'/%3E%3C/svg%3E"
        />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-background px-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <span className="mx-auto flex items-center justify-center w-20 h-20 rounded-xl shadow-lg">
            <PiPiggyBankBold className="text-sky-500 dark:text-sky-400 text-5xl" />
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
            <span className="block">Budgetly</span>
            <span className="block text-xl font-semibold text-muted-foreground mt-1">
              Your Personal Finance Dashboard
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Take control of your money with a modern, privacy-friendly budgeting
            app. Track expenses, set budgets, and visualize your financial
            health—all in one place.
          </p>
          <ul className="text-left text-base text-muted-foreground space-y-2 mx-auto max-w-md">
            <li>• View a dashboard with income, expenses, and trends</li>
            <li>• Set and monitor budgets by category</li>
            <li>• Log and review expenses with notes and categories</li>
            <li>• Visualize spending with interactive charts</li>
            <li>• Secure, ready for user accounts and backend integration</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="default" size="lg">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/budgets">
              <Button variant="outline" size="lg">
                View Budgets
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" size="lg">
                View Expenses
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
