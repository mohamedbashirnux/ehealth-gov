'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  LogOut, 
  Search,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ClipboardList,
  TrendingUp,
  Upload
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

interface AdminData {
  id: string
  username: string
  email: string
  role: string
  department: string
}

interface Application {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    username: string
    phoneNumber: string
  }
  serviceId: {
    _id: string
    name: string
    description: string
    category: string
  }
  fullName: string
  phoneNumber: string
  region: string
  district?: string
  reasonForApplication: string
  reasonForMedicalLetter: string
  otherReasonForMedicalLetter?: string
  documents: Array<{
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    requirementType: string
    uploadedAt: string
  }>
  officialDocuments?: Array<{
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    documentType: string
    uploadedAt: string
    uploadedBy: string
  }>
  status: string
  submittedAt: string
  reviewedAt?: string
  reviewNotes?: string
}

export default function AllApplicationsPage() {
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showOfficialDocumentDialog, setShowOfficialDocumentDialog] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [officialDocumentFile, setOfficialDocumentFile] = useState<File | null>(null)
  const [uploadingOfficialDoc, setUploadingOfficialDoc] = useState(false)

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminData')
    if (adminData) {
      const admin = JSON.parse(adminData)
      
      // Only allow 'admin' role, not 'super_admin'
      if (admin.role === 'admin') {
        setAdmin(admin)
      } else if (admin.role === 'super_admin') {
        // Super admin should go to main dashboard
        window.location.href = '/dashboard'
        return
      } else {
        // Invalid role, redirect to login
        window.location.href = '/auth/admins/login'
        return
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/auth/admins/login'
      return
    }

    fetchApplications()
  }, [])

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.serviceId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.region.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications')
      const data = await response.json()
      if (data.success) {
        setApplications(data.applications)
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

  const handleReviewApplication = (application: Application) => {
    setSelectedApplication(application)
    setReviewStatus(application.status)
    setReviewNotes(application.reviewNotes || '')
    setShowReviewDialog(true)
  }

  const handleUploadOfficialDocument = (application: Application) => {
    setSelectedApplication(application)
    setShowOfficialDocumentDialog(true)
  }

  const handleOfficialDocumentSubmit = async () => {
    if (!selectedApplication || !officialDocumentFile || !admin) return

    setUploadingOfficialDoc(true)
    try {
      const formData = new FormData()
      formData.append('applicationId', selectedApplication._id)
      formData.append('adminId', admin.id)
      formData.append('officialDocument', officialDocumentFile)

      const response = await fetch('/api/admin/applications/official-document', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Official document uploaded successfully!')
        setShowOfficialDocumentDialog(false)
        setOfficialDocumentFile(null)
        fetchApplications() // Refresh applications
      } else {
        toast.error(result.message || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading official document:', error)
      toast.error('Failed to upload document')
    }
    setUploadingOfficialDoc(false)
  }

  const handleUpdateStatus = async () => {
    if (!selectedApplication || !reviewStatus) return

    // Make review notes required for rejected status
    if (reviewStatus === 'rejected' && !reviewNotes.trim()) {
      toast.error('Review notes are required when rejecting an application')
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication._id,
          status: reviewStatus,
          reviewNotes: reviewNotes,
          reviewedBy: admin?.id
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Application status updated successfully')
        setShowReviewDialog(false)
        fetchApplications() // Refresh the list
      } else {
        toast.error(data.message || 'Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
    setUpdating(false)
  }

  const handleDownloadDocument = (filePath: string, fileName: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a')
    link.href = filePath
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null // Will redirect to login
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Applications</h1>
          <p className="text-muted-foreground">Manage and review all submitted applications</p>
        </div>
      </div>

      {/* Applications Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">
              Applications ({filteredApplications.length})
            </CardTitle>
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {application.userId ? getInitials(application.userId.firstName, application.userId.lastName) : 'NA'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">
                            {application.userId ? `${application.userId.firstName} ${application.userId.lastName}` : application.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{application.userId?.username || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.serviceId && (
                          <>
                            <Badge className={getCategoryColor(application.serviceId.category)}>
                              {application.serviceId.category}
                            </Badge>
                            <span className="text-sm font-medium">
                              {application.serviceId.name}
                            </span>
                          </>
                        )}
                        {!application.serviceId && (
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
                        <span className="font-medium">Phone:</span> {application.phoneNumber}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Medical Reason */}
                    <div className="text-sm">
                      <span className="font-medium">Medical Reason:</span>
                      <p className="text-muted-foreground mt-1">
                        {application.reasonForMedicalLetter}
                        {application.reasonForMedicalLetter === 'Other' && application.otherReasonForMedicalLetter && (
                          <span className="block mt-1 text-xs">
                            Details: {application.otherReasonForMedicalLetter}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Reason Preview */}
                    <div className="text-sm">
                      <span className="font-medium">Reason:</span>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {application.reasonForApplication}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                    <Badge className={`${getStatusColor(application.status)} px-3 py-1`}>
                      {getStatusText(application.status)}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReviewApplication(application)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      {application.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleUploadOfficialDocument(application)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload Official Doc
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
              <p className="text-muted-foreground">No applications found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All the dialogs from the original page would go here... */}
      {/* I'll add them in the next part to keep this manageable */}

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Applicant Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Full Name</span>
                    <p className="text-sm">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Username</span>
                    <p className="text-sm">@{selectedApplication.userId?.username || 'N/A'}</p>
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
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Medical Reason</span>
                    <p className="text-sm">{selectedApplication.reasonForMedicalLetter}</p>
                    {selectedApplication.reasonForMedicalLetter === 'Other' && selectedApplication.otherReasonForMedicalLetter && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Details: {selectedApplication.otherReasonForMedicalLetter}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Service Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Service:</span>
                    <span>{selectedApplication.serviceId?.name || 'Unknown Service'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Category:</span>
                    {selectedApplication.serviceId ? (
                      <Badge className={getCategoryColor(selectedApplication.serviceId.category)}>
                        {selectedApplication.serviceId.category}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Status:</span>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {getStatusText(selectedApplication.status)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-sm text-muted-foreground">Service Description</span>
                  <p className="text-sm mt-1">{selectedApplication.serviceId?.description || 'No description available'}</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Application Details</h3>
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Reason for Application</span>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedApplication.reasonForApplication}
                  </p>
                </div>
              </div>

              {/* Documents */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Application Documents</h3>
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc, index) => (
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
                            onClick={() => handleDownloadDocument(doc.filePath, doc.fileName)}
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
                <div className="space-y-3">
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
                            onClick={() => handleDownloadDocument(doc.filePath, doc.fileName)}
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

              {/* Timeline */}
              <div className="space-y-3">
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
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedApplication.reviewNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Application Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  {selectedApplication.userId ? `${selectedApplication.userId.firstName} ${selectedApplication.userId.lastName}` : selectedApplication.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.serviceId?.name || 'Unknown Service'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Review Notes {reviewStatus === 'rejected' ? '(Required)' : '(Optional)'}
                </label>
                <Textarea
                  placeholder={reviewStatus === 'rejected' 
                    ? "Please explain why this application is being rejected..." 
                    : "Add notes about your review decision..."
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className={reviewStatus === 'rejected' && !reviewNotes.trim() ? 'border-red-500' : ''}
                />
                {reviewStatus === 'rejected' && !reviewNotes.trim() && (
                  <p className="text-sm text-red-500">Review notes are required when rejecting an application</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || !reviewStatus}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Official Document Upload Dialog */}
      <Dialog open={showOfficialDocumentDialog} onOpenChange={setShowOfficialDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Official Document</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Application Approved</h3>
                <p className="text-sm text-green-700">
                  Upload the official document for <strong>{selectedApplication.userId ? `${selectedApplication.userId.firstName} ${selectedApplication.userId.lastName}` : selectedApplication.fullName}</strong>'s 
                  application for <strong>{selectedApplication.serviceId?.name || 'Unknown Service'}</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Official Document *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {officialDocumentFile ? (
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">{officialDocumentFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(officialDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="mt-2"
                        onClick={() => setOfficialDocumentFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload the official document
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF, DOC, DOCX (MAX. 10MB)
                      </p>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size must be less than 10MB')
                              return
                            }
                            setOfficialDocumentFile(file)
                          }
                        }}
                        className="hidden"
                        id="admin-official-document-upload"
                      />
                      <label
                        htmlFor="admin-official-document-upload"
                        className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOfficialDocumentDialog(false)
                    setOfficialDocumentFile(null)
                  }}
                  disabled={uploadingOfficialDoc}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOfficialDocumentSubmit}
                  disabled={uploadingOfficialDoc || !officialDocumentFile}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploadingOfficialDoc ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}