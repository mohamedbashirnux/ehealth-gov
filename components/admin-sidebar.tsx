"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  ClipboardList,
  Archive,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// Admin Dashboard Data
const data = {
  user: {
    name: "Admin User",
    email: "admin@health.gov",
    avatar: "/Images/logo1.png",
  },
  // Single dashboard item (standalone)
  dashboard: {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: BarChart3,
  },
  navMain: [
    {
      title: "Applications",
      url: "#",
      icon: ClipboardList,
      isActive: true,
      items: [
        {
          title: "All Applications",
          url: "/admin-dashboard/all-applications",
        },
      ],
    },
    {
      title: "Documents",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Document Library",
          url: "/admin-dashboard/documents",
        },
      ],
    },
    {
      title: "Archive",
      url: "#",
      icon: Archive,
      items: [
        {
          title: "Archive Records",
          url: "/admin-dashboard/archive",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Medical Reports",
          url: "/admin-dashboard/reports",
        },
      ],
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
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
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard - Standalone Item */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                tooltip={data.dashboard.title}
                className={pathname === data.dashboard.url 
                  ? 'bg-blue-600 !bg-blue-600 text-white !text-white hover:bg-blue-700 hover:text-white' 
                  : 'hover:bg-gray-100'
                }
              >
                <Link href={data.dashboard.url}>
                  <data.dashboard.icon className={pathname === data.dashboard.url ? 'text-white !text-white' : ''} />
                  <span className={pathname === data.dashboard.url ? 'text-white !text-white' : ''}>{data.dashboard.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
       
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}