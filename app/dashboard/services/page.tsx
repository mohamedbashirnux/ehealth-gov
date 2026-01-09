'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ServiceForm } from "@/components/forms/serviceForm"
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
import { MoreHorizontal, Edit, Trash2, Search, Filter, Eye } from "lucide-react"
import { toast } from "sonner"

interface Service {
  _id: string
  name: string
  description: string
  category: string
  requirements: string[]
  fee: number
  isActive: boolean
  createdAt: string
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'medical' | 'administrative' | 'emergency' | 'consultation' | 'referral' | 'other'>('all')
  const [viewRequirementsDialog, setViewRequirementsDialog] = useState(false)
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
  const [selectedServiceName, setSelectedServiceName] = useState('')
  const [viewDescriptionDialog, setViewDescriptionDialog] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  // Filter services based on search and category filter
  useEffect(() => {
    let filtered = services

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter)
    }

    setFilteredServices(filtered)
  }, [services, searchTerm, categoryFilter])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to fetch services')
    }
    setLoading(false)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setShowDialog(true)
  }

  const handleAddNew = () => {
    setEditingService(null)
    setShowDialog(true)
  }

  const handleDialogClose = () => {
    setShowDialog(false)
    setEditingService(null)
  }

  const handleFormSuccess = () => {
    fetchServices() // Refresh the services list
  }

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id)
    setDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return
    
    try {
      const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serviceToDelete })
      })

      const data = await response.json()
      if (data.success) {
        fetchServices()
        toast.success('Service deleted successfully!', {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          },
          position: 'top-right'
        })
      } else {
        toast.error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
    
    setDeleteDialog(false)
    setServiceToDelete(null)
  }

  const handleViewRequirements = (service: Service) => {
    setSelectedRequirements(service.requirements || [])
    setSelectedServiceName(service.name)
    setViewRequirementsDialog(true)
  }

  const handleViewDescription = (service: Service) => {
    setSelectedDescription(service.description)
    setSelectedServiceName(service.name)
    setViewDescriptionDialog(true)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      medical: 'bg-blue-100 text-blue-800',
      administrative: 'bg-gray-100 text-gray-800',
      emergency: 'bg-red-100 text-red-800',
      consultation: 'bg-green-100 text-green-800',
      referral: 'bg-purple-100 text-purple-800',
      other: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services Management</h2>
          <p className="text-muted-foreground">Manage ministry services and their details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Services ({filteredServices.length})</CardTitle>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
              
              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {categoryFilter === 'all' ? 'All Categories' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('medical')}>
                    Medical
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('administrative')}>
                    Administrative
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('emergency')}>
                    Emergency
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('consultation')}>
                    Consultation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('referral')}>
                    Referral
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategoryFilter('other')}>
                    Other
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={handleAddNew}>
                Add New Service
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[50px]" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate">
                          {service.description.length > 50 
                            ? `${service.description.substring(0, 50)}...`
                            : service.description
                          }
                        </span>
                        {service.description.length > 50 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDescription(service)}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {service.requirements && service.requirements.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {service.requirements.join(', ').length > 50 
                              ? `${service.requirements.join(', ').substring(0, 50)}...`
                              : service.requirements.join(', ')
                            }
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequirements(service)}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No requirements</span>
                      )}
                    </TableCell>
                    <TableCell>${service.fee}</TableCell>
                    <TableCell>
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(service._id)}
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

      {/* Add/Edit Service Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            isOpen={showDialog}
            onClose={handleDialogClose}
            editingService={editingService}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* View Description Dialog */}
      <Dialog open={viewDescriptionDialog} onOpenChange={setViewDescriptionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Description for {selectedServiceName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">{selectedDescription}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Requirements Dialog */}
      <Dialog open={viewRequirementsDialog} onOpenChange={setViewRequirementsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Requirements for {selectedServiceName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedRequirements.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {selectedRequirements.map((requirement, index) => (
                  <li key={index} className="text-sm">{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No requirements specified for this service.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              and remove it from our system.
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