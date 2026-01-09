import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'

// GET - Get all applications for admin review
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter
    let filter: any = {}
    if (status && status !== 'all') {
      filter.status = status
    }

    // Get applications with pagination
    const applications = await Application.find(filter)
      .populate('serviceId', 'name description category')
      .populate('userId', 'firstName lastName username phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalCount = await Application.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applications'
    }, { status: 500 })
  }
}

// PUT - Update application status
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { applicationId, status, reviewNotes, reviewedBy } = body
    
    if (!applicationId || !status) {
      return NextResponse.json({
        success: false,
        message: 'Application ID and status are required'
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status'
      }, { status: 400 })
    }

    // Update application
    const updateData: any = {
      status,
      reviewedAt: new Date()
    }

    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('serviceId', 'name description category')
     .populate('userId', 'firstName lastName username phoneNumber')

    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Application not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application
    })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update application status'
    }, { status: 500 })
  }
}