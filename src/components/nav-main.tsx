"use client"

import {
  IconDashboard,
  IconFolder,
  IconReport,
  IconChartBar,
  type Icon,
} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export const navMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: IconFolder,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: IconReport,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: IconChartBar,
  },
  {
    title: "Income",
    url: "/income",
    icon: IconReport, // You can use a more appropriate icon if desired
  },
  {
    title: "Settings",
    url: "/settings",
    icon: IconFolder, // You can use a settings icon if desired
  },
]
