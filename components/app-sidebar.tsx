"use client"

import * as React from "react"
import {
  Settings2,
  Users,
  UserPlus,
  Shield,
  Briefcase,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavDashboard } from "@/components/nav-dashboard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Ministry of Health Data
const data = {
  user: {
    name: "Admin User",
    email: "admin@health.gov",
    avatar: "/Images/logo1.png",
  },
  // Single dashboard item (standalone)
  dashboard: {
    title: "Dashboard",
    url: "/dashboard",  // Changed from /dashboard_super_admin to /dashboard
    icon: Settings2,
  },
  navMain: [
    {
      title: "Essential",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Manage",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Manage Admins",
          url: "/dashboard/admin-management",
        },
        {
          title: "Manage Services",
          url: "/dashboard/services",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <img 
            src="/Images/logo1.png" 
            alt="Ministry Logo" 
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Ministry of Health</span>
            <span className="text-xs text-muted-foreground">Federal Government</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavDashboard item={data.dashboard} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* User info moved to header navbar */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
