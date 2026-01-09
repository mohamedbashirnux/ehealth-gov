'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, Sparkles, Clock, Rocket } from "lucide-react"

interface AdminData {
  id: string
  username: string
  email: string
  role: string
  department: string
}

export default function SuperAdminDashboard() {
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get admin data from localStorage
    const storedAdminData = localStorage.getItem('adminData')
    if (storedAdminData) {
      const admin = JSON.parse(storedAdminData)
      
      // Only allow super_admin to access this dashboard
      if (admin.role === 'super_admin') {
        setAdminData(admin)
      } else if (admin.role === 'admin') {
        // Regular admin should go to admin dashboard
        window.location.href = '/admin-dashboard'
        return
      } else {
        // Invalid role, redirect to login
        window.location.href = '/auth/admins/login'
        return
      }
    } else {
      // No admin data, redirect to login
      window.location.href = '/auth/admins/login'
      return
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!adminData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please login to access the dashboard</p>
            <Button onClick={() => window.location.href = '/auth/admins/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Construction className="h-16 w-16 text-blue-600" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome, <span className="font-semibold text-blue-600">{adminData.username}</span>! 
          We're building something amazing for you.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Rocket className="h-6 w-6 text-blue-600" />
            Exciting Features Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-6">
              We're working hard to bring you powerful administrative tools and insights. 
              Stay tuned for these upcoming features:
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <h3 className="font-semibold">System Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive system performance and usage analytics
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                <h3 className="font-semibold">Admin Management</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Create, manage, and monitor admin accounts and permissions
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
                <h3 className="font-semibold">Service Configuration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure and manage ministry services and workflows
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-orange-600 rounded-full"></div>
                <h3 className="font-semibold">Advanced Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports and export data insights
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-red-50 to-rose-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                <h3 className="font-semibold">Security Center</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor security events and manage system access
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-teal-600 rounded-full"></div>
                <h3 className="font-semibold">System Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Development Status</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Our development team is actively working on these features. 
              We'll notify you as soon as they're ready!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>In Active Development</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <span>Coming Q1 2026</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Access Info */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Your Current Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-semibold text-purple-600">Super Administrator</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-semibold">{adminData.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
