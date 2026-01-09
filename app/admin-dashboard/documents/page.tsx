'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search,
  FileText,
  Download,
  Upload,
  Eye,
  Calendar,
  User
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Application {
  _id: string
  userId: {
    firstName: string
    lastName: string
    username: string
  }
  serviceId: {
    name: string
    category: string
  }
  fullName: string
  region: string
  district?: string
  status: string
  submittedAt: string
  officialDocuments?: Array<{
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    documentType: string
    uploadedAt: string
    uploadedBy: string
  }>
}

export default function DocumentsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchApplicationsWithDocuments()
  }, [])

  useEffect(() => {
    // Apply search and status filters
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.serviceId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.region.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'with_documents') {
        filtered = filtered.filter(app => app.officialDocuments && app.officialDocuments.length > 0)
      } else if (statusFilter === 'without_documents') {
        filtered = filtered.filter(app => !app.officialDocuments || app.officialDocuments.length === 0)
      } else {
        filtered = filtered.filter(app => app.status === statusFilter)
      }
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  const fetchApplicationsWithDocuments = async () => {
    try {
      console.log('Fetching applications for documents page...')
      const response = await fetch('/api/admin/reports?type=applications')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('Documents page loaded:', data.data.applications?.length || 0)
        // Filter applications that are approved or completed (potential for official documents)
        const relevantApps = (data.data.applications || []).filter((app: Application) => 
          app.status === 'approved' || app.status === 'completed'
        )
        setApplications(relevantApps)
      } else {
        console.error('Failed to fetch applications:', data.message)
        toast.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    }
    setLoading(false)
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetailsDialog(true)
  }

  const handleDownloadDocument = (applicationId: string, documentIndex: number, fileName: string) => {
    // Use the new download API endpoint for official documents
    const downloadUrl = `/api/files/download?applicationId=${applicationId}&documentIndex=${documentIndex}&type=official`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const statusTexts = {
      approved: 'Approved',
      completed: 'Completed'
    }
    return statusTexts[status as keyof typeof statusTexts] || status
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

  const hasOfficialDocuments = (app: Application) => {
    return app.officialDocuments && app.officialDocuments.length > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Manage official documents for approved applications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {applications.filter(app => hasOfficialDocuments(app)).length} with documents
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">
              {applications.filter(app => !hasOfficialDocuments(app)).length} pending upload
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{applications.filter(app => hasOfficialDocuments(app)).length}</p>
                <p className="text-xs text-muted-foreground">With Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{applications.filter(app => !hasOfficialDocuments(app)).length}</p>
                <p className="text-xs text-muted-foreground">Pending Upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{applications.filter(app => app.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications with Documents */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Applications & Documents ({filteredApplications.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-80"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="with_documents">With Documents</SelectItem>
                  <SelectItem value="without_documents">Pending Upload</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* User and Service Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {application.userId.firstName} {application.userId.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{application.userId.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.serviceId ? (
                          <>
                            <Badge className={getCategoryColor(application.serviceId.category)}>
                              {application.serviceId.category}
                            </Badge>
                            <span className="text-sm font-medium">
                              {application.serviceId.name}
                            </span>
                          </>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Unknown Service
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Region:</span> {application.region}
                      </div>
                      {application.district && (
                        <div>
                          <span className="font-medium">District:</span> {application.district}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Documents:</span> 
                        <span className={hasOfficialDocuments(application) ? 'text-green-600' : 'text-orange-600'}>
                          {hasOfficialDocuments(application) ? ` ${application.officialDocuments!.length} uploaded` : ' None'}
                        </span>
                      </div>
                    </div>

                    {/* Official Documents Preview */}
                    {hasOfficialDocuments(application) && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Official Documents</span>
                        </div>
                        <div className="space-y-1">
                          {application.officialDocuments!.slice(0, 2).map((doc, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-xs text-green-700">{doc.fileName}</span>
                              <span className="text-xs text-green-600">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                          {application.officialDocuments!.length > 2 && (
                            <p className="text-xs text-green-600">
                              +{application.officialDocuments!.length - 2} more documents
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                      {hasOfficialDocuments(application) && (
                        <Badge className="bg-green-100 text-green-800">
                          <FileText className="h-3 w-3 mr-1" />
                          {application.officialDocuments!.length} docs
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {!hasOfficialDocuments(application) && application.status === 'approved' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            // Navigate to main dashboard to upload document
                            window.location.href = '/admin-dashboard'
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Doc
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No applications found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Documents</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Application Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Application Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Applicant</span>
                    <p className="text-sm">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Service</span>
                    <p className="text-sm">{selectedApplication.serviceId?.name || 'Unknown Service'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Region</span>
                    <p className="text-sm">{selectedApplication.region}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {getStatusText(selectedApplication.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Official Documents */}
              {hasOfficialDocuments(selectedApplication) ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Official Documents</h3>
                  <div className="space-y-2">
                    {selectedApplication.officialDocuments!.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">{doc.documentType || 'Official Document'}</p>
                            <p className="text-xs text-green-600">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded by: {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()}
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
                            onClick={() => handleDownloadDocument(selectedApplication._id, index, doc.fileName)}
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
              ) : (
                <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                  <Upload className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <p className="text-orange-700 font-medium">No official documents uploaded yet</p>
                  <p className="text-sm text-orange-600 mt-1">
                    {selectedApplication.status === 'approved' 
                      ? 'This application is approved and ready for document upload'
                      : 'Official documents can be uploaded once the application is approved'
                    }
                  </p>
                  {selectedApplication.status === 'approved' && (
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setShowDetailsDialog(false)
                        window.location.href = '/admin-dashboard'
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Document
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}