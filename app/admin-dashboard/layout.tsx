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
  Calendar
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

// Dynamically import AdminSidebar to avoid hydration issues
const AdminSidebar = dynamic(() => import("@/components/admin-sidebar").then(mod => ({ default: mod.AdminSidebar })), {
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

export default function AdminDashboardLayout({
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
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex w-full items-center gap-2 px-4">
            {/* Left side - Sidebar trigger */}
            <SidebarTrigger className="-ml-1" />
            
            {/* Center - Search bar */}
            <div className="flex flex-1 items-center justify-center px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications, users, documents..."
                  className="pl-10 w-full"
                />
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
                        <p className="text-sm font-medium">New application submitted</p>
                        <p className="text-xs text-muted-foreground">Medical certificate request</p>
                        <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                      <div className="h-2 w-2 mt-2 rounded-full bg-yellow-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Application approved</p>
                        <p className="text-xs text-muted-foreground">Document ready for download</p>
                        <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted">
                      <div className="h-2 w-2 mt-2 rounded-full bg-green-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System update</p>
                        <p className="text-xs text-muted-foreground">New features available</p>
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
                          : admin?.username || 'Admin User'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {admin?.email || 'admin@health.gov.so'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {admin?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Admin Details */}
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{admin?.email || 'admin@health.gov.so'}</span>
                    </div>
                    {admin?.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{admin.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>{admin?.department || 'Health Department'}</span>
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