"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconTrendingDown,
  IconTrendingUp,
  IconReceipt2,
  IconTargetArrow,
  IconCoins,
} from "@tabler/icons-react";
import { PiPiggyBankBold } from "react-icons/pi";
import { FaRegUserCircle } from "react-icons/fa";
import Link from "next/link";

import { useAuth } from "@/components/auth-context";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain, navMainItems } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isLoggedIn, user } = useAuth();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/" className="flex items-center gap-2">
                <PiPiggyBankBold className="text-sky-500 dark:text-sky-400" size={28} />
                <span
                  className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-md"
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent', backgroundImage: 'linear-gradient(to right, #0ea5e9, #3b82f6, #34d399)' }}
                >
                  Budgetly
                  <noscript>
                    <span style={{ color: '#0ea5e9' }}>Budgetly</span>
                  </noscript>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Welcome message under logo with improved UI, only if logged in */}
        {isLoggedIn && user && (
          <div className="mt-3 px-2 mb-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2 shadow-sm">
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border border-sky-200 shadow-sm"
                />
              )}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Welcome</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground leading-tight break-all">
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 text-muted-foreground cursor-pointer" tabIndex={0} aria-label="Account info">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                          <rect x="9" y="8" width="2" height="5" rx="1" fill="currentColor" />
                          <rect x="9" y="5" width="2" height="2" rx="1" fill="currentColor" />
                        </svg>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      To use a different account, go to the Settings page.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMainItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url} className="flex items-center gap-2 w-full">
                  {item.icon && <item.icon size={20} />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* Removed Income and Settings from here; now handled in nav-main.tsx */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
          <a
            href="https://github.com/rxghavc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View GitHub"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.479C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
            </svg>
            <span>View GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/raghavcommandur"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View LinkedIn"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2 3.6 4.59v5.606z" />
            </svg>
            <span>View LinkedIn</span>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
