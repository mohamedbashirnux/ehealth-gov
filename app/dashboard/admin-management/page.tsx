'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminForm } from "@/components/forms/adminForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Search, Filter } from "lucide-react"
import { toast } from "sonner"

interface Admin {
  _id: string
  fullname?: string  // Optional for backward compatibility
  phone?: string     // Optional for backward compatibility
  email: string
  username: string
  role: 'admin' | 'super_admin'
  department: string
  createdAt: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'super_admin'>('all')

  useEffect(() => {
    fetchAdmins()
  }, [])

  // Filter admins based on search and role filter
  useEffect(() => {
    let filtered = admins

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        (admin.fullname && admin.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.username && admin.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (admin.phone && admin.phone.includes(searchTerm))
      )
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(admin => admin.role === roleFilter)
    }

    setFilteredAdmins(filtered)
  }, [admins, searchTerm, roleFilter])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin')
      const data = await response.json()
      if (data.success) {
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Failed to fetch admins')
    }
    setLoading(false)
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setShowDialog(true)
  }

  const handleAddNew = () => {
    setEditingAdmin(null)
    setShowDialog(true)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setEditingAdmin(null)
  }

  const handleFormSuccess = () => {
    fetchAdmins() // Refresh the admin list
  }

  const handleDeleteClick = (id: string) => {
    setAdminToDelete(id)
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return
    
    try {
      const response = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminToDelete })
      })

      const data = await response.json()
      if (data.success) {
        fetchAdmins()
        toast.success('Admin deleted successfully!', {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          }
        })
      } else {
        toast.error('Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
    
    setDeleteDialog(false)
    setAdminToDelete(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Admin Management</h2>
              <p className="text-muted-foreground">Manage system administrators and their permissions</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Admins ({filteredAdmins.length})</CardTitle>
                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, username, email or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-80"
                    />
                  </div>
                  
                  {/* Sort/Filter Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        {roleFilter === 'all' ? 'All Roles' : roleFilter === 'admin' ? 'Admin' : 'Super Admin'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                        All Roles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRoleFilter('admin')}>
                        Admin Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRoleFilter('super_admin')}>
                        Super Admin Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button onClick={handleAddNew}>
                    Add New Admin
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[50px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin._id}>
                        <TableCell className="font-medium">{admin.fullname || 'N/A'}</TableCell>
                        <TableCell>{admin.phone || 'N/A'}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.username}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            admin.role === 'super_admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>{admin.department}</TableCell>
                        <TableCell>
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(admin)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(admin._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Admin Dialog */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </DialogTitle>
              </DialogHeader>
              <AdminForm
                isOpen={showDialog}
                onClose={handleDialogClose}
                editingAdmin={editingAdmin}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Alert Dialog */}
          <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the admin
                  account and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialog(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
  )
}