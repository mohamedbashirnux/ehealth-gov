"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if any sub-item is active
          const hasActiveSubItem = item.items?.some(subItem => pathname === subItem.url)
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || hasActiveSubItem}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={hasActiveSubItem 
                      ? 'bg-blue-600 !bg-blue-600 text-white !text-white hover:bg-blue-700 hover:text-white' 
                      : 'hover:bg-gray-100'
                    }
                  >
                    {item.icon && <item.icon className={hasActiveSubItem ? 'text-white !text-white' : ''} />}
                    <span className={hasActiveSubItem ? 'text-white !text-white' : ''}>{item.title}</span>
                    <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${hasActiveSubItem ? 'text-white !text-white' : ''}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isActive = pathname === subItem.url
                      
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link 
                              href={subItem.url}
                              className={isActive 
                                ? 'bg-blue-600 !bg-blue-600 text-white !text-white hover:bg-blue-700 hover:text-white font-medium' 
                                : 'hover:bg-gray-100 hover:text-gray-900'
                              }
                              style={isActive ? { backgroundColor: '#2563eb !important', color: 'white !important' } : {}}
                            >
                              <span className={isActive ? 'text-white !text-white' : ''}>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
