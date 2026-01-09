'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  BarChart3,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  Filter,
  FileText,
  Eye,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  MoreHorizontal
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  reasonForMedicalLetter: string
  otherReasonForMedicalLetter?: string
  reasonForApplication: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  applicationNumber: string
  documents: Array<{
    _id: string
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    requirementType: string
    uploadedAt: string
  }>
  officialDocuments?: Array<{
    _id: string
    fileName: string
    fileType: string
    fileSize: number
    filePath: string
    documentType: string
    uploadedAt: string
    uploadedBy: string
  }>
  createdAt: string
  updatedAt: string
}

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
  officialDocumentPath: string
  archiveNumber: string
  archivedAt: string
  archivedBy: {
    username: string
  }
}

export default function ReportsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [archives, setArchives] = useState<ArchiveRecord[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  
  // Date filters
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  
  // Other filters (removed search)
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')

  // Predefined Somali regions
  const SOMALI_REGIONS = [
    'Awdal', 'Woqooyi Galbeed', 'Togdheer', 'Sool', 'Sanaag', 'Marodijeh',
    'Bari', 'Nugaal', 'Mudug', 'Galguduud', 'Hiiraan', 'Shabeellaha Dhexe',
    'Banaadir', 'Shabeellaha Hoose', 'Bay', 'Bakool', 'Gedo', 'Jubbada Hoose', 'Jubbada Dhexe'
  ]

  const MEDICAL_SERVICES = [
    'Cancer (Oncology)',
    'Cardiac Diseases',
    'Kidney Diseases',
    'Neurological & Neurosurgical Conditions',
    'Orthopedic & Trauma Surgery',
    'Pediatric Specialized Care',
    'Advanced Diagnostic Services',
    'Infertility & Reproductive Health',
    'Ophthalmology (Advanced Eye Care)',
    'Burns & Plastic / Reconstructive Surgery',
    'Other'
  ]

  const CRITICAL_SERVICES = ['Cancer (Oncology)', 'Cardiac Diseases']

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    console.log('Applications state updated:', applications.length, 'applications')
    console.log('Filtered applications will be:', applications.length, 'after filtering')
    applyFilters()
  }, [applications, regionFilter, statusFilter, serviceFilter, fromDate, toDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('Fetching reports data...')
      // Fetch all data from the reports API
      const response = await fetch('/api/admin/reports?type=all')
      console.log('Reports response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Reports response data:', data)
      
      if (data.success) {
        console.log('Reports data loaded successfully')
        console.log('Raw data structure:', data)
        console.log('Applications array:', data.data.applications)
        console.log('Applications length:', data.data.applications?.length || 0)
        console.log('Archives length:', data.data.archives?.length || 0)
        console.log('Statistics:', data.statistics)
        
        // Check if applications is actually an array
        if (Array.isArray(data.data.applications)) {
          console.log('Applications is an array with', data.data.applications.length, 'items')
          if (data.data.applications.length > 0) {
            console.log('First application:', data.data.applications[0])
          }
        } else {
          console.log('Applications is not an array:', typeof data.data.applications)
        }
        
        setApplications(data.data.applications || [])
        setArchives(data.data.archives || [])
        
        toast.success('Reports data loaded successfully!')
      } else {
        console.error('Reports API returned error:', data.message)
        toast.error(`Failed to fetch reports data: ${data.message}`)
      }
    } catch (error) {
      console.error('Error fetching reports data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to fetch reports data: ${errorMessage}`)
    }
    setLoading(false)
  }

  const applyFilters = () => {
    console.log('Applying filters to', applications.length, 'applications')
    let filtered = applications

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(app => 
        new Date(app.submittedAt) >= fromDate
      )
      console.log('After fromDate filter:', filtered.length)
    }
    
    if (toDate) {
      const endOfDay = new Date(toDate)
      endOfDay.setHours(23, 59, 59, 999)
      filtered = filtered.filter(app => 
        new Date(app.submittedAt) <= endOfDay
      )
      console.log('After toDate filter:', filtered.length)
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(app => app.region === regionFilter)
      console.log('After region filter:', filtered.length)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
      console.log('After status filter:', filtered.length)
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(app => app.reasonForMedicalLetter === serviceFilter)
      console.log('After service filter:', filtered.length)
    }

    console.log('Final filtered applications:', filtered.length)
    setFilteredApplications(filtered)
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetailsDialog(true)
  }

  const getServiceDisplayName = (application: Application) => {
    // If serviceId is populated and has a name, use it
    if (application.serviceId && typeof application.serviceId === 'object' && application.serviceId.name) {
      return application.serviceId.name
    }
    
    // Otherwise, create a meaningful name based on the medical service
    const medicalService = application.reasonForMedicalLetter
    if (medicalService && medicalService !== 'Other') {
      return `${medicalService} Service`
    }
    
    return 'Medical Service Application'
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'under_review': return <Eye className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Pause className="h-4 w-4" />
    }
  }

  const exportReport = () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `medical_applications_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Report exported successfully!')
  }

  const exportPDF = async () => {
    // Dynamic import to avoid SSR issues
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF()
    
    // Add logo
    const logoImg = new Image()
    logoImg.onload = function() {
      // Add logo
      doc.addImage(logoImg, 'PNG', 20, 15, 30, 30)
      
      // Add header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Ministry of Health', 60, 25)
      doc.setFontSize(16)
      doc.text('Medical Applications Report', 60, 35)
      
      // Add generation date
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${new Date().toLocaleString()}`, 60, 45)
      
      // Add filter information
      let yPos = 60
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Report Filters:', 20, yPos)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      yPos += 10
      
      if (fromDate) {
        doc.text(`From Date: ${format(fromDate, 'MMMM do, yyyy')}`, 20, yPos)
        yPos += 8
      }
      if (toDate) {
        doc.text(`To Date: ${format(toDate, 'MMMM do, yyyy')}`, 20, yPos)
        yPos += 8
      }
      doc.text(`Region: ${regionFilter === 'all' ? 'All Regions' : regionFilter}`, 20, yPos)
      yPos += 8
      doc.text(`Status: ${statusFilter === 'all' ? 'All Statuses' : statusFilter.replace('_', ' ')}`, 20, yPos)
      yPos += 8
      doc.text(`Medical Service: ${serviceFilter === 'all' ? 'All Services' : serviceFilter}`, 20, yPos)
      yPos += 15
      
      // Add statistics
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary Statistics:', 20, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Applications: ${totalApplications}`, 20, yPos)
      doc.text(`Critical Cases: ${criticalCases}`, 100, yPos)
      yPos += 8
      doc.text(`Completed: ${completedApplications}`, 20, yPos)
      doc.text(`Pending: ${pendingApplications}`, 100, yPos)
      yPos += 15
      
      // Prepare table data
      const tableData = filteredApplications.map(app => [
        app.fullName,
        `${app.phoneNumber}\n${app.region}${app.district ? ` • ${app.district}` : ''}`,
        app.reasonForMedicalLetter + (CRITICAL_SERVICES.includes(app.reasonForMedicalLetter) ? ' ⚠️' : ''),
        getServiceDisplayName(app),
        `${app.documents?.length || 0} uploaded${app.officialDocuments?.length ? `\n+ ${app.officialDocuments.length} official` : ''}`,
        app.status.replace('_', ' '),
        `Submitted: ${format(new Date(app.submittedAt), 'MMM dd, yyyy')}${app.reviewedAt ? `\nReviewed: ${format(new Date(app.reviewedAt), 'MMM dd, yyyy')}` : ''}`
      ])
      
      // Add table
      autoTable(doc, {
        head: [['Patient', 'Contact & Location', 'Medical Service', 'Service Type', 'Documents', 'Status', 'Dates']],
        body: tableData,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Patient
          1: { cellWidth: 30 }, // Contact & Location
          2: { cellWidth: 35 }, // Medical Service
          3: { cellWidth: 25 }, // Service Type
          4: { cellWidth: 20 }, // Documents
          5: { cellWidth: 20 }, // Status
          6: { cellWidth: 30 }  // Dates
        }
      })
      
      // Save the PDF
      doc.save(`medical_applications_report_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF Report exported successfully!')
    }
    
    logoImg.onerror = function() {
      // If logo fails to load, generate PDF without logo
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Ministry of Health', 20, 25)
      doc.setFontSize(16)
      doc.text('Medical Applications Report', 20, 35)
      
      // Continue with rest of PDF generation...
      toast.success('PDF Report exported successfully!')
    }
    
    logoImg.src = '/images/logo1.png'
  }

  const generateCSVContent = () => {
    let csv = 'Medical Applications Report\n'
    csv += `Generated: ${new Date().toLocaleString()}\n`
    csv += `Total Applications: ${filteredApplications.length}\n`
    csv += `Critical Cases: ${filteredApplications.filter(app => CRITICAL_SERVICES.includes(app.reasonForMedicalLetter)).length}\n\n`
    csv += 'Application Number,Patient Name,Phone,Region,District,Medical Service,Status,Service Type,Submitted Date,Reviewed Date\n'
    
    filteredApplications.forEach(app => {
      csv += `${app.applicationNumber},${app.fullName},${app.phoneNumber},${app.region},${app.district || ''},${app.reasonForMedicalLetter},${app.status},${app.serviceId?.name || 'Unknown'},${format(new Date(app.submittedAt), 'MMM dd, yyyy')},${app.reviewedAt ? format(new Date(app.reviewedAt), 'MMM dd, yyyy') : 'Not reviewed'}\n`
    })

    return csv
  }

  // Calculate statistics
  const totalApplications = filteredApplications.length
  const criticalCases = filteredApplications.filter(app => CRITICAL_SERVICES.includes(app.reasonForMedicalLetter)).length
  const completedApplications = filteredApplications.filter(app => app.status === 'completed').length
  const pendingApplications = filteredApplications.filter(app => app.status === 'pending').length
  const thisMonthApplications = filteredApplications.filter(app => {
    const submittedDate = new Date(app.submittedAt)
    const thisMonth = new Date()
    return submittedDate.getMonth() === thisMonth.getMonth() && 
           submittedDate.getFullYear() === thisMonth.getFullYear()
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Applications Report</h1>
          <p className="text-muted-foreground">Comprehensive analytics and reporting dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport} disabled={filteredApplications.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportPDF} disabled={filteredApplications.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalApplications}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{criticalCases}</p>
                <p className="text-xs text-muted-foreground">Critical Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{completedApplications}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingApplications}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{thisMonthApplications}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{archives.length}</p>
                <p className="text-xs text-muted-foreground">Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Cases Alert */}
      {criticalCases > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Critical Cases Alert</h3>
                <p className="text-sm text-red-700">
                  {criticalCases} critical cases (Cancer & Cardiac) require immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {SOMALI_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Medical Service Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Medical Service</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {MEDICAL_SERVICES.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Applications Report ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medical Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{app.fullName}</p>
                      <p className="text-sm text-muted-foreground">{app.phoneNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getServiceColor(app.reasonForMedicalLetter)}>
                      {CRITICAL_SERVICES.includes(app.reasonForMedicalLetter) && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {app.reasonForMedicalLetter}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)}>
                      {getStatusIcon(app.status)}
                      <span className="ml-1 capitalize">{app.status.replace('_', ' ')}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{app.region}</p>
                      {app.district && <p className="text-sm text-muted-foreground">{app.district}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(app.submittedAt), 'MMM dd, yyyy')}</p>
                      {app.reviewedAt && (
                        <p className="text-muted-foreground">Reviewed: {format(new Date(app.reviewedAt), 'MMM dd')}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(app)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Applications Found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-800">Patient Information</h3>
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
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-red-800">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Medical Service</span>
                    <div className="mt-1">
                      <Badge className={getServiceColor(selectedApplication.reasonForMedicalLetter)}>
                        {CRITICAL_SERVICES.includes(selectedApplication.reasonForMedicalLetter) && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {selectedApplication.reasonForMedicalLetter}
                      </Badge>
                    </div>
                  </div>
                  {selectedApplication.otherReasonForMedicalLetter && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Additional Details</span>
                      <p className="text-sm mt-1">{selectedApplication.otherReasonForMedicalLetter}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Service Type</span>
                    <p className="text-sm mt-1">
                      {getServiceDisplayName(selectedApplication)}
                    </p>
                    {typeof selectedApplication.serviceId === 'string' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Service ID: {selectedApplication.serviceId}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Application Reason</span>
                    <p className="text-sm mt-1 p-3 bg-white rounded border">
                      {selectedApplication.reasonForApplication}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Application Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Current Status</span>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedApplication.status)}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-1 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Application Number</span>
                    <p className="text-sm font-mono">{selectedApplication.applicationNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Submitted Date</span>
                    <p className="text-sm">{format(new Date(selectedApplication.submittedAt), 'MMMM dd, yyyy')}</p>
                  </div>
                  {selectedApplication.reviewedAt && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Reviewed Date</span>
                      <p className="text-sm">{format(new Date(selectedApplication.reviewedAt), 'MMMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-green-800">Documents</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Uploaded Documents</span>
                    <p className="text-sm">{selectedApplication.documents?.length || 0} documents</p>
                  </div>
                  {selectedApplication.officialDocuments && selectedApplication.officialDocuments.length > 0 && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Official Documents</span>
                      <p className="text-sm text-green-600">{selectedApplication.officialDocuments.length} official documents</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}