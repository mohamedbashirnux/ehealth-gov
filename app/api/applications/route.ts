import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'
import { User } from '@/models/user'
import { Service } from '@/models/service'

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Ensure all models are registered
    const models = { Application, User, Service }
    
    const formData = await request.formData()
    
    // Extract form fields
    const userId = formData.get('userId') as string
    const serviceId = formData.get('serviceId') as string
    const fullName = formData.get('fullName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const region = formData.get('region') as string
    const district = formData.get('district') as string
    const reasonForApplication = formData.get('reasonForApplication') as string
    const reasonForMedicalLetter = formData.get('reasonForMedicalLetter') as string
    const otherReasonForMedicalLetter = formData.get('otherReasonForMedicalLetter') as string
    
    // Debug logging
    console.log('Received form data:', {
      userId,
      serviceId,
      fullName,
      phoneNumber,
      region,
      district,
      reasonForApplication,
      reasonForMedicalLetter,
      otherReasonForMedicalLetter
    })
    
    // Validate required fields
    if (!userId || !serviceId || !fullName || !phoneNumber || !region) {
      return NextResponse.json({
        success: false,
        message: 'All required fields must be provided'
      }, { status: 400 })
    }

    // Validate medical reason field
    if (!reasonForMedicalLetter) {
      return NextResponse.json({
        success: false,
        message: 'Reason for medical letter is required'
      }, { status: 400 })
    }

    // Check for existing active application
    const existingApplication = await Application.findOne({
      userId,
      serviceId,
      status: { $in: ['pending', 'under_review', 'approved'] }
    })

    if (existingApplication) {
      return NextResponse.json({
        success: false,
        message: 'You already have an active application for this service'
      }, { status: 400 })
    }

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Handle file uploads - Store in MongoDB as Base64
    const documents = []
    const files = formData.getAll('documents') as File[]
    const requirementTypes = formData.getAll('requirementTypes') as string[]

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const requirementType = requirementTypes[i]
        
        if (file && file.size > 0) {
          try {
            // Convert file to Base64 and store in MongoDB
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const base64Data = buffer.toString('base64')
            
            // Add document info with Base64 data
            documents.push({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileData: base64Data, // Store file as Base64 in MongoDB
              requirementType: requirementType,
              uploadedAt: new Date()
            })
            
            console.log(`File ${file.name} converted to Base64 and stored in MongoDB`)
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError)
            return NextResponse.json({
              success: false,
              message: `Failed to process file: ${file.name}`
            }, { status: 500 })
          }
        }
      }
    }

    // Generate application number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 9999) + 1
    const applicationNumber = `APP-${timestamp}-${random.toString().padStart(4, '0')}`

    // Create application
    const application = new Application({
      userId,
      serviceId,
      fullName,
      phoneNumber,
      region,
      district: district || undefined,
      reasonForApplication: reasonForApplication || 'Service application request',
      reasonForMedicalLetter,
      otherReasonForMedicalLetter: otherReasonForMedicalLetter || undefined,
      documents,
      applicationNumber
    })

    await application.save()

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt
      }
    })

  } catch (error) {
    console.error('Application submission error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json({
      success: false,
      message: 'Application submission failed. Please try again.'
    }, { status: 500 })
  }
}

// GET - Get user applications
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Ensure all models are registered
    const models = { Application, User, Service }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    const applications = await Application.find({ userId })
      .populate('serviceId', 'name description category')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      applications
    })

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applications'
    }, { status: 500 })
  }
}