'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Search,
  Filter,
  Eye,
  Languages,
  List,
  FileText,
  Download,
  CheckCircle,
  Stethoscope,
  Building2,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  MoreHorizontal,
  ArrowRight
} from "lucide-react"
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
import { toast } from "sonner"
import { ApplicationForm } from "@/components/forms/applicationForm"

interface UserData {
  id: string
  firstName: string
  lastName: string
  username: string
  phoneNumber: string
  createdAt: string
}

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

export default function UserDashboard() {
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState<UserData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'medical' | 'administrative' | 'emergency' | 'consultation' | 'referral' | 'other'>('all')
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showRequirementsDialog, setShowRequirementsDialog] = useState(false)
  const [showApplicationDetailsDialog, setShowApplicationDetailsDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // Fetch applications after setting user
      fetchApplicationsForUser(parsedUser.id)
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/auth/users/user-login'
      return
    }

    fetchServices()
  }, [])

  const fetchApplicationsForUser = async (userId: string) => {
    setApplicationsLoading(true)
    try {
      const response = await fetch(`/api/applications?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    }
    setApplicationsLoading(false)
  }

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services.filter(service => service.isActive)

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

  const handleLogout = () => {
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    window.location.href = '/auth/users/user-login'
  }

  const handleApplyClick = async (service: Service) => {
    if (!user) return
    
    // Check if user already has an active application for this service
    const existingApplication = applications.find(app => 
      app.serviceId._id === service._id && 
      ['pending', 'under_review', 'approved'].includes(app.status)
    )
    
    if (existingApplication) {
      toast.error(`You already have an active application for this service (Status: ${getStatusText(existingApplication.status)})`)
      return
    }
    
    setSelectedService(service)
    setShowApplicationDialog(true)
  }

  const handleViewRequirements = (service: Service) => {
    setSelectedService(service)
    setShowRequirementsDialog(true)
  }

  const handleViewApplicationDetails = (application: any) => {
    setSelectedApplication(application)
    setShowApplicationDetailsDialog(true)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      medical: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      administrative: 'bg-gradient-to-r from-gray-500 to-slate-600',
      emergency: 'bg-gradient-to-r from-red-500 to-rose-600',
      consultation: 'bg-gradient-to-r from-green-500 to-emerald-600',
      referral: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      other: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    }
    return colors[category as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  const getCategoryBadgeColor = (category: string) => {
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      medical: <Stethoscope className="h-5 w-5" />,
      administrative: <Building2 className="h-5 w-5" />,
      emergency: <AlertTriangle className="h-5 w-5" />,
      consultation: <MessageSquare className="h-5 w-5" />,
      referral: <RefreshCw className="h-5 w-5" />,
      other: <MoreHorizontal className="h-5 w-5" />
    }
    return icons[category as keyof typeof icons] || <FileText className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'Pending',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    }
    return statusTexts[status as keyof typeof statusTexts] || status
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with User Info - Mobile Responsive */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-sm sm:text-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold truncate">
                    {t('welcome')}, {user.firstName} {user.lastName}!
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                    <div className="flex items-center space-x-1 truncate">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{t('memberSince')} {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Language Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <Languages className="h-4 w-4 mr-2" />
                      Language
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeLanguage('en')}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('so')}>
                      Somali
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-none">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Applications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">My Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-muted-foreground">Loading applications...</span>
              </div>
            ) : applications.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {applications.map((application) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Service Name and Category */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-base truncate">
                            {application.serviceId?.name || 'Service'}
                          </h3>
                          <Badge className={getCategoryBadgeColor(application.serviceId?.category || 'other')}>
                            {application.serviceId?.category || 'Other'}
                          </Badge>
                        </div>
                        
                        {/* Status Badge - Large and Prominent */}
                        <div className="flex justify-center py-2">
                          <Badge className={`${getStatusColor(application.status)} px-4 py-2 text-sm font-medium`}>
                            {getStatusText(application.status)}
                          </Badge>
                        </div>
                        
                        {/* Submission Date */}
                        <div className="text-center text-sm text-muted-foreground">
                          Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                        </div>
                        
                        {/* View Details Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleViewApplicationDetails(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications submitted yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Apply for a service below to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Section - Mobile Responsive */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl">{t('availableServices')} ({filteredServices.length})</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchServices')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-80"
                  />
                </div>
                
                {/* Category Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {categoryFilter === 'all' ? t('allCategories') : t(categoryFilter)}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                      {t('allCategories')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('medical')}>
                      {t('medical')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('administrative')}>
                      {t('administrative')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('emergency')}>
                      {t('emergency')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('consultation')}>
                      {t('consultation')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('referral')}>
                      {t('referral')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCategoryFilter('other')}>
                      {t('other')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Card key={service._id} className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden">
                  <CardHeader className={`${getCategoryColor(service.category)} text-white p-4 sm:p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-white leading-tight">{service.name}</CardTitle>
                          <Badge className="bg-white/20 text-white border-0 mt-1 text-xs">
                            {t(service.category)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <p className="text-gray-600 leading-relaxed text-justify text-sm sm:text-base">
                      {service.description}
                    </p>
                    
                    {service.requirements && service.requirements.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800">{t('requirements')}:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRequirements(service)}
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <List className="h-3 w-3 mr-1" />
                            {t('viewAll')} ({service.requirements.length})
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {service.requirements.slice(0, 3).map((req, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-gray-600 text-justify leading-relaxed">{req}</span>
                            </div>
                          ))}
                          {service.requirements.length > 3 && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="text-xs font-medium">
                                +{service.requirements.length - 3} more requirements
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      {(() => {
                        const existingApplication = applications.find(app => 
                          app.serviceId._id === service._id && 
                          ['pending', 'under_review', 'approved'].includes(app.status)
                        )
                        
                        if (existingApplication) {
                          return (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              variant="outline"
                              disabled
                            >
                              {getStatusText(existingApplication.status)}
                            </Button>
                          )
                        }
                        
                        return (
                          <Button 
                            size="sm" 
                            className={`flex-1 ${getCategoryColor(service.category)} text-white hover:opacity-90 transition-opacity`}
                            onClick={() => handleApplyClick(service)}
                          >
                            {t('applyNow')}
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )
                      })()}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewRequirements(service)}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Services Available</h3>
                <p className="text-gray-600 text-sm sm:text-base">{t('noServices')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={showApplicationDetailsDialog} onOpenChange={setShowApplicationDetailsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                {/* Service Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Service Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Service:</span>
                      <span>{selectedApplication.serviceId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Category:</span>
                      <Badge className={getCategoryBadgeColor(selectedApplication.serviceId?.category || 'other')}>
                        {selectedApplication.serviceId?.category || 'Other'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {getStatusText(selectedApplication.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Application Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Application Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Full Name</span>
                      <p className="text-sm">{selectedApplication.fullName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Phone Number</span>
                      <p className="text-sm">{selectedApplication.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Region</span>
                      <p className="text-sm">{selectedApplication.region}</p>
                    </div>
                    {selectedApplication.district && (
                      <div>
                        <span className="font-medium text-sm text-muted-foreground">District</span>
                        <p className="text-sm">{selectedApplication.district}</p>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <span className="font-medium text-sm text-muted-foreground">Reason for Application</span>
                      <p className="text-sm mt-1">{selectedApplication.reasonForApplication}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Application Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedApplication.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Application Reviewed</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedApplication.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Notes */}
                {selectedApplication.reviewNotes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Review Notes</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{selectedApplication.reviewNotes}</p>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Application Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.documents.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.requirementType}</p>
                              <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  console.log('Downloading application document:', {
                                    applicationId: selectedApplication._id,
                                    documentIndex: index,
                                    fileName: doc.fileName,
                                    type: 'application'
                                  })
                                  
                                  // Use fetch to get the file and handle errors properly
                                  const downloadUrl = `/api/files/download?applicationId=${selectedApplication._id}&documentIndex=${index}&type=application`
                                  console.log('Download URL:', downloadUrl)
                                  
                                  const response = await fetch(downloadUrl)
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json()
                                    console.error('Download failed:', errorData)
                                    toast.error(`Download failed: ${errorData.message}`)
                                    return
                                  }
                                  
                                  // Get the blob and create download link
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.download = doc.fileName
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  window.URL.revokeObjectURL(url)
                                  
                                  toast.success('Document downloaded successfully!')
                                } catch (error) {
                                  console.error('Download error:', error)
                                  toast.error('Failed to download document')
                                }
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Documents */}
                {selectedApplication.officialDocuments && selectedApplication.officialDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Official Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.officialDocuments.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-800">{doc.documentType}</p>
                              <p className="text-xs text-green-600">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  console.log('Downloading official document:', {
                                    applicationId: selectedApplication._id,
                                    documentIndex: index,
                                    fileName: doc.fileName,
                                    type: 'official'
                                  })
                                  
                                  // Use fetch to get the file and handle errors properly
                                  const downloadUrl = `/api/files/download?applicationId=${selectedApplication._id}&documentIndex=${index}&type=official`
                                  console.log('Download URL:', downloadUrl)
                                  
                                  const response = await fetch(downloadUrl)
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json()
                                    console.error('Download failed:', errorData)
                                    toast.error(`Download failed: ${errorData.message}`)
                                    return
                                  }
                                  
                                  // Get the blob and create download link
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.download = doc.fileName
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  window.URL.revokeObjectURL(url)
                                  
                                  toast.success('Document downloaded successfully!')
                                } catch (error) {
                                  console.error('Download error:', error)
                                  toast.error('Failed to download document')
                                }
                              }}
                              className="border-green-300 text-green-700 hover:bg-green-100"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Requirements View Dialog */}
        <Dialog open={showRequirementsDialog} onOpenChange={setShowRequirementsDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className={`${getCategoryColor(selectedService?.category || 'other')} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  {getCategoryIcon(selectedService?.category || 'other')}
                </div>
                <span>{t('requirements')} - {selectedService?.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedService?.requirements && selectedService.requirements.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Please ensure you have all the following requirements before applying:
                  </p>
                  {selectedService.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 leading-relaxed text-justify">{requirement}</p>
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Total Requirements: {selectedService.requirements.length}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Make sure to prepare all documents before starting your application.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">{t('noRequirementsSpecified')}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Application Dialog */}
        <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply for {selectedService?.name}</DialogTitle>
            </DialogHeader>
            {selectedService && user && (
              <ApplicationForm
                service={selectedService}
                user={user}
                onClose={() => setShowApplicationDialog(false)}
                onSuccess={() => {
                  // Refresh services and applications
                  fetchServices()
                  fetchApplicationsForUser(user.id)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}