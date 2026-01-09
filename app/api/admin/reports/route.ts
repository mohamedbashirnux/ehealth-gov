import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'
import { Archive } from '@/models/archive'
import { Service } from '@/models/service'
import { User } from '@/models/user'
import { Admin } from '@/models/admin'
import mongoose from 'mongoose'

// GET - Get all data for reports (applications and archives)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'all' // 'applications', 'archives', or 'all'
    
    let responseData: any = {}

    // Fetch applications if requested
    if (dataType === 'applications' || dataType === 'all') {
      try {
        console.log('Fetching applications from database...')
        
        // Check if services exist first
        const serviceCount = await Service.countDocuments({})
        console.log(`Found ${serviceCount} services in database`)
        
        // First try without populate to see if we get basic data
        const applications = await Application.find({})
          .sort({ createdAt: -1 })
          .lean() // Use lean() for better performance

        console.log(`Found ${applications.length} applications in database`)
        
        if (applications.length > 0) {
          console.log('Sample application:', JSON.stringify(applications[0], null, 2))
        }

        // Try to populate if applications exist
        let populatedApplications = applications
        if (applications.length > 0) {
          try {
            populatedApplications = await Application.find({})
              .populate({
                path: 'serviceId',
                select: 'name description category',
                model: 'Service'
              })
              .populate({
                path: 'userId', 
                select: 'firstName lastName username phoneNumber',
                model: 'User'
              })
              .populate({
                path: 'reviewedBy',
                select: 'username',
                model: 'Admin'
              })
              .sort({ createdAt: -1 })
              .lean()
            
            console.log('Successfully populated applications')
            
            // Check if serviceId population worked
            populatedApplications.forEach((app: any, index: number) => {
              if (!app.serviceId || typeof app.serviceId === 'string') {
                console.log(`Application ${index + 1}: serviceId not populated, ID: ${app.serviceId}`)
              } else {
                console.log(`Application ${index + 1}: serviceId populated successfully: ${app.serviceId.name}`)
              }
            })
            
          } catch (populateError) {
            console.warn('Population failed, using basic data:', populateError)
            // Use basic data if population fails
          }
        }

        responseData.applications = populatedApplications
        console.log(`Returning ${populatedApplications.length} applications for reports`)
      } catch (appError) {
        console.error('Error fetching applications:', appError)
        responseData.applications = []
      }
    }

    // Fetch archives if requested
    if (dataType === 'archives' || dataType === 'all') {
      try {
        const archives = await Archive.find({})
          .populate('archivedBy', 'username')
          .sort({ archivedAt: -1 })
          .lean() // Use lean() for better performance

        responseData.archives = archives
        console.log(`Fetched ${archives.length} archives for reports`)
      } catch (archiveError) {
        console.error('Error fetching archives:', archiveError)
        responseData.archives = []
      }
    }

    // Calculate summary statistics
    const applications = responseData.applications || []
    const archives = responseData.archives || []

    const statistics = {
      totalApplications: applications.length,
      criticalCases: applications.filter((app: any) => 
        app.reasonForMedicalLetter === 'Cancer (Oncology)' || 
        app.reasonForMedicalLetter === 'Cardiac Diseases'
      ).length,
      completedApplications: applications.filter((app: any) => app.status === 'completed').length,
      pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
      underReviewApplications: applications.filter((app: any) => app.status === 'under_review').length,
      approvedApplications: applications.filter((app: any) => app.status === 'approved').length,
      rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length,
      totalArchives: archives.length,
      thisMonthApplications: applications.filter((app: any) => {
        const submittedDate = new Date(app.submittedAt)
        const thisMonth = new Date()
        return submittedDate.getMonth() === thisMonth.getMonth() && 
               submittedDate.getFullYear() === thisMonth.getFullYear()
      }).length,
      thisMonthArchives: archives.filter((archive: any) => {
        const archivedDate = new Date(archive.archivedAt)
        const thisMonth = new Date()
        return archivedDate.getMonth() === thisMonth.getMonth() && 
               archivedDate.getFullYear() === thisMonth.getFullYear()
      }).length
    }

    console.log('Final response data:', {
      applicationsCount: responseData.applications?.length || 0,
      archivesCount: responseData.archives?.length || 0,
      statistics
    })

    return NextResponse.json({
      success: true,
      message: 'Reports data fetched successfully',
      data: responseData,
      statistics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get reports data error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch reports data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Generate custom report with filters
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { 
      fromDate, 
      toDate, 
      region, 
      status, 
      medicalService,
      reportType = 'applications' // 'applications' or 'archives'
    } = body

    let filter: any = {}
    let dateField = reportType === 'applications' ? 'submittedAt' : 'archivedAt'

    // Build date filter
    if (fromDate || toDate) {
      filter[dateField] = {}
      if (fromDate) {
        filter[dateField].$gte = new Date(fromDate)
      }
      if (toDate) {
        const endDate = new Date(toDate)
        endDate.setHours(23, 59, 59, 999)
        filter[dateField].$lte = endDate
      }
    }

    // Build other filters based on report type
    if (reportType === 'applications') {
      if (region && region !== 'all') {
        filter.region = region
      }
      if (status && status !== 'all') {
        filter.status = status
      }
      if (medicalService && medicalService !== 'all') {
        filter.reasonForMedicalLetter = medicalService
      }

      const applications = await Application.find(filter)
        .populate('serviceId', 'name description category')
        .populate('userId', 'firstName lastName username phoneNumber')
        .populate('reviewedBy', 'username')
        .sort({ createdAt: -1 })
        .lean()

      return NextResponse.json({
        success: true,
        message: 'Filtered applications report generated',
        data: { applications },
        count: applications.length,
        filters: { fromDate, toDate, region, status, medicalService }
      })

    } else if (reportType === 'archives') {
      if (region && region !== 'all') {
        filter.patientRegion = region
      }
      if (medicalService && medicalService !== 'all') {
        filter.medicalService = medicalService
      }

      const archives = await Archive.find(filter)
        .populate('archivedBy', 'username')
        .sort({ archivedAt: -1 })
        .lean()

      return NextResponse.json({
        success: true,
        message: 'Filtered archives report generated',
        data: { archives },
        count: archives.length,
        filters: { fromDate, toDate, region, medicalService }
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid report type'
    }, { status: 400 })

  } catch (error) {
    console.error('Generate custom report error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to generate custom report',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}