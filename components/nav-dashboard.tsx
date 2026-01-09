"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDashboard({
  item,
}: {
  item: {
    title: string
    url: string
    icon?: LucideIcon
  }
}) {
  const pathname = usePathname()
  const isActive = pathname === item.url
  
  console.log('Dashboard - Current pathname:', pathname, 'Item URL:', item.url, 'Is Active:', isActive) // Debug log

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link 
              href={item.url}
              className={isActive 
                ? 'bg-blue-600 !bg-blue-600 text-white !text-white hover:bg-blue-700 hover:text-white font-medium !important' 
                : 'hover:bg-gray-100 hover:text-gray-900'
              }
              style={isActive ? { 
                backgroundColor: '#2563eb !important', 
                color: 'white !important',
                fontWeight: '500'
              } : {}}
            >
              {item.icon && <item.icon className={isActive ? 'text-white !text-white' : ''} />}
              <span className={isActive ? 'text-white !text-white font-medium' : ''}>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}