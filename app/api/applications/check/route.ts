import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'

// GET - Check if user has active application for service
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const serviceId = searchParams.get('serviceId')
    
    if (!userId || !serviceId) {
      return NextResponse.json({
        success: false,
        message: 'User ID and Service ID are required'
      }, { status: 400 })
    }

    // Check for existing active application
    const existingApplication = await Application.findOne({
      userId,
      serviceId,
      status: { $in: ['pending', 'under_review', 'approved'] }
    })

    return NextResponse.json({
      success: true,
      hasActiveApplication: !!existingApplication,
      application: existingApplication ? {
        id: existingApplication._id,
        status: existingApplication.status,
        submittedAt: existingApplication.submittedAt
      } : null
    })

  } catch (error) {
    console.error('Check application error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check application status'
    }, { status: 500 })
  }
}