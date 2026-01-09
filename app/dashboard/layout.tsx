"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle,
  Moon,
  Sun,
  Shield,
  Mail,
  Phone,
  Calendar,
  Crown
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

// Dynamically import AppSidebar to avoid hydration issues
const AppSidebar = dynamic(() => import("@/components/app-sidebar").then(mod => ({ default: mod.AppSidebar })), {
  ssr: false,
  loading: () => (
    <div className="w-64 bg-gray-100 border-r animate-pulse">
      <div className="p-4 space-y-4">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
})

interface AdminData {
  id: string
  username: string
  email: string
  role: string
  department: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  createdAt?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [admin, setAdmin] = useState<AdminData | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    // Get admin data from localStorage
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      setAdmin(JSON.parse(adminData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminData')
    toast.success('Logged out successfully')
    window.location.href = '/auth/admins/login'
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full items-center gap-2 px-4">
            {/* Left side - Sidebar trigger */}
            <SidebarTrigger className="-ml-1" />
            
            {/* Center - Title */}
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Ministry of Health & Human Services</p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}

              {/* Help */}
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 p-2">
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                      <div className="h-2 w-2 mt-2 rounded-full bg-blue-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System status update</p>
                        <p className="text-xs text-muted-foreground">All services operational</p>
                        <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                      <div className="h-2 w-2 mt-2 rounded-full bg-yellow-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New admin registered</p>
                        <p className="text-xs text-muted-foreground">Pending approval</p>
                        <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                      <div className="h-2 w-2 mt-2 rounded-full bg-green-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Database backup completed</p>
                        <p className="text-xs text-muted-foreground">Daily backup successful</p>
                        <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {admin?.firstName && admin?.lastName 
                          ? `${admin.firstName} ${admin.lastName}` 
                          : admin?.username || 'Super Admin'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {admin?.email || 'superadmin@health.gov.so'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          {admin?.role?.replace('_', ' ').toUpperCase() || 'SUPER ADMIN'}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Admin Details */}
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{admin?.email || 'superadmin@health.gov.so'}</span>
                    </div>
                    {admin?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{admin.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>{admin?.department || 'System Administration'}</span>
                    </div>
                    {admin?.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}