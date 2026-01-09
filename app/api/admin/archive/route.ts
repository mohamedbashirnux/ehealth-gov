import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Archive } from '@/models/archive'
import { Application } from '@/models/application'
import { User } from '@/models/user'
import { Service } from '@/models/service'
import { Admin } from '@/models/admin'

// GET - Get all archived records
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Ensure all models are registered
    const models = { Archive, Application, User, Service, Admin }
    
    const { searchParams } = new URL(request.url)
    const medicalService = searchParams.get('medicalService')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter
    let filter: any = {}
    
    if (medicalService && medicalService !== 'all') {
      filter.medicalService = medicalService
    }
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      filter.archivedAt = { $gte: startDate, $lte: endDate }
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1)
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
      filter.archivedAt = { $gte: startDate, $lte: endDate }
    }

    // Get archived records
    const archives = await Archive.find(filter)
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalCount = await Archive.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      archives,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get archives error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch archives'
    }, { status: 500 })
  }
}

// POST - Archive a completed application
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Ensure all models are registered
    const models = { Archive, Application, User, Service, Admin }
    
    const body = await request.json()
    const { applicationId, archivedBy } = body
    
    if (!applicationId || !archivedBy) {
      return NextResponse.json({
        success: false,
        message: 'Application ID and archived by are required'
      }, { status: 400 })
    }

    // Check if application exists and is completed
    const application = await Application.findById(applicationId)
      .populate('userId', 'firstName lastName phoneNumber')
      .populate('serviceId', 'name') as any

    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Application not found'
      }, { status: 404 })
    }

    if (application.status !== 'completed') {
      return NextResponse.json({
        success: false,
        message: 'Only completed applications can be archived'
      }, { status: 400 })
    }

    // Check if already archived
    const existingArchive = await Archive.findOne({ applicationId })
    if (existingArchive) {
      return NextResponse.json({
        success: false,
        message: 'Application is already archived'
      }, { status: 400 })
    }

    // Get official document information
    const officialDocuments = application.officialDocuments as any[]
    const officialDocument = officialDocuments && officialDocuments.length > 0 
      ? officialDocuments[0] 
      : null
    
    if (!officialDocument) {
      return NextResponse.json({
        success: false,
        message: 'No official document found for this application'
      }, { status: 400 })
    }

    // Create a reference path for the official document
    // Since we now use Base64 storage, we'll create a logical path reference
    let officialDocumentPath: string
    
    if (officialDocument.filePath) {
      // Use existing file path if available (legacy documents)
      officialDocumentPath = officialDocument.filePath
    } else if (officialDocument.fileData) {
      // For Base64 documents, create a logical reference path
      officialDocumentPath = `base64/${applicationId}/${officialDocument.fileName}`
    } else {
      return NextResponse.json({
        success: false,
        message: 'Official document has no valid storage reference'
      }, { status: 400 })
    }

    // Get service name safely
    const serviceType = (application.serviceId as any)?.name || 'Unknown Service'

    // Get medical service from application
    const medicalService = application.reasonForMedicalLetter || 'Other'

    // Generate archive number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 9999) + 1
    const archiveNumber = `ARC-${timestamp}-${random.toString().padStart(4, '0')}`

    // Create archive record
    const archive = new Archive({
      applicationId,
      patientName: application.fullName,
      patientPhone: application.phoneNumber,
      patientRegion: application.region,
      patientDistrict: application.district,
      serviceType,
      medicalService,
      referralReason: application.reasonForApplication, // Use original application reason
      officialDocumentPath: officialDocumentPath, // Use the determined path
      archiveNumber,
      archivedBy
    })

    await archive.save()

    return NextResponse.json({
      success: true,
      message: 'Application archived successfully',
      archive: {
        id: archive._id,
        archiveNumber: archive.archiveNumber,
        patientName: archive.patientName,
        medicalService: archive.medicalService,
        archivedAt: archive.archivedAt
      }
    })

  } catch (error) {
    console.error('Archive application error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to archive application'
    }, { status: 500 })
  }
}