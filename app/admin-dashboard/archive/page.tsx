'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Archive,
  Eye,
  Plus,
  Calendar,
  FileText,
  Download
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

interface ArchiveRecord {
  _id: string
  applicationId: string
  patientName: string
  patientPhone: string
  patientRegion: string
  patientDistrict?: string
  serviceType: string
  medicalService: string
  referralReason: string
  destinationCountry?: string
  estimatedDuration?: string
  officialDocumentPath: string
  archiveNumber: string
  archivedAt: string
  notes?: string
  archivedBy: {
    username: string
  }
}

interface CompletedApplication {
  _id: string
  userId: {
    firstName: string
    lastName: string
    phoneNumber: string
  }
  serviceId: {
    name: string
  }
  fullName: string
  phoneNumber: string
  region: string
  district?: string
  reasonForMedicalLetter: string
  otherReasonForMedicalLetter?: string
  reasonForApplication: string
  status: string
  submittedAt: string
  officialDocuments?: Array<{
    fileName: string
    filePath: string
  }>
}

export default function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveRecord[]>([])
  const [filteredArchives, setFilteredArchives] = useState<ArchiveRecord[]>([])
  const [completedApplications, setCompletedApplications] = useState<CompletedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [selectedArchive, setSelectedArchive] = useState<ArchiveRecord | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<CompletedApplication | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    fetchArchives()
    fetchCompletedApplications()
  }, [])

  useEffect(() => {
    // Apply search and service filters
    let filtered = archives

    if (searchTerm) {
      filtered = filtered.filter(archive => 
        archive.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archive.medicalService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archive.patientRegion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archive.archiveNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(archive => archive.medicalService === serviceFilter)
    }

    setFilteredArchives(filtered)
  }, [archives, searchTerm, serviceFilter])

  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/admin/archive')
      const data = await response.json()
      if (data.success) {
        setArchives(data.archives)
      }
    } catch (error) {
      console.error('Error fetching archives:', error)
      toast.error('Failed to fetch archives')
    }
  }

  const fetchCompletedApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications')
      const data = await response.json()
      if (data.success) {
        // Filter completed applications that haven't been archived yet
        const completed = data.applications.filter((app: CompletedApplication) => 
          app.status === 'completed' && 
          app.officialDocuments && 
          app.officialDocuments.length > 0
        )
        
        // Fetch current archives to check which applications are already archived
        const archiveResponse = await fetch('/api/admin/archive')
        const archiveData = await archiveResponse.json()
        
        if (archiveData.success) {
          const archivedAppIds = archiveData.archives.map((archive: any) => archive.applicationId)
          const unarchived = completed.filter((app: CompletedApplication) => 
            !archivedAppIds.includes(app._id)
          )
          setCompletedApplications(unarchived)
        } else {
          setCompletedApplications(completed)
        }
      }
    } catch (error) {
      console.error('Error fetching completed applications:', error)
      toast.error('Failed to fetch completed applications')
    }
    setLoading(false)
  }



  const handleViewDetails = (archive: ArchiveRecord) => {
    setSelectedArchive(archive)
    setShowDetailsDialog(true)
  }

  const handleArchiveApplication = (application: CompletedApplication) => {
    setSelectedApplication(application)
    setShowArchiveDialog(true)
  }

  const handleSubmitArchive = async () => {
    if (!selectedApplication) {
      toast.error('No application selected')
      return
    }

    const adminData = localStorage.getItem('adminData')
    if (!adminData) {
      toast.error('Admin session expired')
      return
    }

    const admin = JSON.parse(adminData)

    setArchiving(true)
    try {
      const response = await fetch('/api/admin/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication._id,
          archivedBy: admin.id
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Application archived successfully!')
        setShowArchiveDialog(false)
        setSelectedApplication(null)
        fetchArchives()
        fetchCompletedApplications()
      } else {
        toast.error(data.message || 'Failed to archive application')
      }
    } catch (error) {
      console.error('Error archiving application:', error)
      toast.error('Failed to archive application')
    }
    setArchiving(false)
  }

  const getServiceColor = (service: string) => {
    const colors = {
      'Cancer (Oncology)': 'bg-red-100 text-red-800',
      'Cardiac Diseases': 'bg-pink-100 text-pink-800',
      'Kidney Diseases': 'bg-blue-100 text-blue-800',
      'Neurological & Neurosurgical Conditions': 'bg-purple-100 text-purple-800',
      'Orthopedic & Trauma Surgery': 'bg-orange-100 text-orange-800',
      'Pediatric Specialized Care': 'bg-green-100 text-green-800',
      'Advanced Diagnostic Services': 'bg-cyan-100 text-cyan-800',
      'Infertility & Reproductive Health': 'bg-rose-100 text-rose-800',
      'Ophthalmology (Advanced Eye Care)': 'bg-indigo-100 text-indigo-800',
      'Burns & Plastic / Reconstructive Surgery': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[service as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading archive...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Archive</h1>
          <p className="text-muted-foreground">Archive and track medical referral records</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold">{archives.length}</span>
            <span className="text-sm text-muted-foreground">archived</span>
          </div>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold">{completedApplications.length}</span>
            <span className="text-sm text-muted-foreground">ready to archive</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{archives.length}</p>
                <p className="text-xs text-muted-foreground">Total Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {archives.filter(a => {
                    const archivedDate = new Date(a.archivedAt)
                    const thisMonth = new Date()
                    return archivedDate.getMonth() === thisMonth.getMonth() && 
                           archivedDate.getFullYear() === thisMonth.getFullYear()
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{completedApplications.length}</p>
                <p className="text-xs text-muted-foreground">Ready to Archive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ready to Archive Applications */}
      {completedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Ready to Archive ({completedApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedApplications.slice(0, 3).map((application) => (
                <div key={application._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-green-800">{application.fullName}</p>
                      <Badge className="bg-green-100 text-green-700">{application.serviceId?.name || 'Unknown Service'}</Badge>
                    </div>
                    <p className="text-sm text-green-600">
                      {application.region} • Completed: {new Date(application.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleArchiveApplication(application)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                </div>
              ))}
              {completedApplications.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{completedApplications.length - 3} more applications ready to archive
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archive Records */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Archive Records ({filteredArchives.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-80"
                />
              </div>
              
              {/* Service Filter */}
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Cancer (Oncology)">Cancer (Oncology)</SelectItem>
                  <SelectItem value="Cardiac Diseases">Cardiac Diseases</SelectItem>
                  <SelectItem value="Kidney Diseases">Kidney Diseases</SelectItem>
                  <SelectItem value="Neurological & Neurosurgical Conditions">Neurological & Neurosurgical</SelectItem>
                  <SelectItem value="Orthopedic & Trauma Surgery">Orthopedic & Trauma Surgery</SelectItem>
                  <SelectItem value="Pediatric Specialized Care">Pediatric Specialized Care</SelectItem>
                  <SelectItem value="Advanced Diagnostic Services">Advanced Diagnostic Services</SelectItem>
                  <SelectItem value="Infertility & Reproductive Health">Infertility & Reproductive Health</SelectItem>
                  <SelectItem value="Ophthalmology (Advanced Eye Care)">Ophthalmology (Advanced Eye Care)</SelectItem>
                  <SelectItem value="Burns & Plastic / Reconstructive Surgery">Burns & Plastic Surgery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArchives.map((archive) => (
              <div key={archive._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Patient and Disease Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="font-semibold text-sm">{archive.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            Archive #{archive.archiveNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getServiceColor(archive.medicalService)}>
                          {archive.medicalService}
                        </Badge>
                      </div>
                    </div>

                    {/* Archive Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Region:</span> {archive.patientRegion}
                      </div>
                      <div>
                        <span className="font-medium">Service:</span> {archive.serviceType}
                      </div>
                      <div>
                        <span className="font-medium">Archived:</span> {new Date(archive.archivedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">By:</span> {archive.archivedBy.username}
                      </div>
                    </div>

                    {/* Referral Reason Preview */}
                    <div className="text-sm">
                      <span className="font-medium">Referral Reason:</span>
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {archive.referralReason}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Archived
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(archive)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredArchives.length === 0 && (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No archive records found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archive Record Details</DialogTitle>
          </DialogHeader>
          {selectedArchive && (
            <div className="space-y-6">
              {/* Archive Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Archive Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Archive Number</span>
                    <p className="text-sm font-mono">{selectedArchive.archiveNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Archived Date</span>
                    <p className="text-sm">{new Date(selectedArchive.archivedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Archived By</span>
                    <p className="text-sm">{selectedArchive.archivedBy.username}</p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Patient Name</span>
                    <p className="text-sm">{selectedArchive.patientName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Phone Number</span>
                    <p className="text-sm">{selectedArchive.patientPhone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Region</span>
                    <p className="text-sm">{selectedArchive.patientRegion}</p>
                  </div>
                  {selectedArchive.patientDistrict && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">District</span>
                      <p className="text-sm">{selectedArchive.patientDistrict}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Medical Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Medical Service:</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getServiceColor(selectedArchive.medicalService)}>
                        {selectedArchive.medicalService}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Service Type</span>
                    <p className="text-sm">{selectedArchive.serviceType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Original Application Reason</span>
                    <p className="text-sm mt-1 p-3 bg-white rounded border">
                      {selectedArchive.referralReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Document Information */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-3 text-green-800">Official Document</h3>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Government Medical Referral Letter</p>
                      <p className="text-xs text-green-600">Official document for {selectedArchive.patientName}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Download official document
                      const link = document.createElement('a')
                      link.href = selectedArchive.officialDocumentPath
                      link.download = `Official_Document_${selectedArchive.archiveNumber}.pdf`
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}  
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Application Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Archive Application</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              {/* Application Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Application to Archive</h3>
                <p className="text-sm text-blue-700">
                  <strong>{selectedApplication.fullName}</strong> - {selectedApplication.serviceId?.name || 'Unknown Service'}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedApplication.region} • Completed: {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Medical Service Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Medical Service</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getServiceColor(selectedApplication.reasonForMedicalLetter)}>
                    {selectedApplication.reasonForMedicalLetter}
                  </Badge>
                </div>
                {selectedApplication.otherReasonForMedicalLetter && (
                  <p className="text-sm text-green-700 mt-2">
                    <strong>Details:</strong> {selectedApplication.otherReasonForMedicalLetter}
                  </p>
                )}
              </div>

              {/* Confirmation */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  This will create an official archive record for this completed application. 
                  The medical service information will be automatically included from the application.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowArchiveDialog(false)
                    setSelectedApplication(null)
                  }}
                  disabled={archiving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitArchive}
                  disabled={archiving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {archiving ? 'Archiving...' : 'Archive Application'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}