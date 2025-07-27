"use client";

import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const clerk = useClerk();
  // List of known top-level routes
  const knownRoutes = [
    "dashboard", "income", "expenses", "budgets", "goals", "settings", "login", "signup", ""
  ];
  const pathParts = pathname.split("/").filter(Boolean);
  const isKnown = pathParts.length === 0 || knownRoutes.includes(pathParts[0]);
  const pageName =
    isKnown
      ? (pathname === "/" ? "Home" : pathParts.map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(" / "))
      : "Not Found";
  
  const handleLoginSignup = () => {
    // Save current path to sessionStorage for redirect after login/signup
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterAuth", pathname);
    }
    router.push("/login");
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-3 px-6 py-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-3 h-6" />
        <h1 className="text-xl font-bold tracking-tight text-foreground/90">{pageName}</h1>
        {/* Show warning if not logged in */}
        {!isLoggedIn && (
          <span className="ml-4 text-sm text-orange-600 font-semibold flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            You are viewing demo data. Please log in to access your own data.
            <span className="text-orange-600 text-xl">&rarr;</span>
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!isLoggedIn && (
            <Button
              variant="outline"
              className="font-medium"
              onClick={handleLoginSignup}
            >
              Login / Signup
            </Button>
          )}
          {isLoggedIn && (
            <Button
              variant="ghost"
              className="font-medium"
              onClick={async () => {
                await clerk.signOut();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
