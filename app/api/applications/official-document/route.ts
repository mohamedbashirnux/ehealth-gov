import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'

// POST - Upload official document for approved application (store in MongoDB)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const formData = await request.formData()
    
    // Extract form fields
    const applicationId = formData.get('applicationId') as string
    const userId = formData.get('userId') as string
    const officialDocument = formData.get('officialDocument') as File
    
    // Validate required fields
    if (!applicationId || !userId || !officialDocument) {
      return NextResponse.json({
        success: false,
        message: 'Application ID, User ID, and official document are required'
      }, { status: 400 })
    }

    // Find the application
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Application not found'
      }, { status: 404 })
    }

    // Check if application belongs to the user
    if (application.userId.toString() !== userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to application'
      }, { status: 403 })
    }

    // Check if application is approved
    if (application.status !== 'approved') {
      return NextResponse.json({
        success: false,
        message: 'Official documents can only be uploaded for approved applications'
      }, { status: 400 })
    }

    // Validate file
    if (officialDocument.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: 'File size must be less than 10MB'
      }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(officialDocument.type)) {
      return NextResponse.json({
        success: false,
        message: 'Only PNG, JPG, PDF, DOC, DOCX files are allowed'
      }, { status: 400 })
    }

    // Convert file to Base64 for MongoDB storage
    const bytes = await officialDocument.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    
    // Add official document to application (stored in MongoDB as Base64)
    const officialDocumentData = {
      fileName: officialDocument.name,
      fileType: officialDocument.type,
      fileSize: officialDocument.size,
      fileData: base64Data, // Store as Base64 in MongoDB
      documentType: 'Official Document',
      uploadedAt: new Date(),
      uploadedBy: 'user'
    }

    // Update application with official document
    await Application.findByIdAndUpdate(
      applicationId,
      { 
        $push: { officialDocuments: officialDocumentData },
        status: 'completed' // Change status to completed when official document is uploaded
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Official document uploaded successfully. Application status updated to completed.',
      document: {
        fileName: officialDocument.name,
        fileSize: officialDocument.size,
        uploadedAt: officialDocumentData.uploadedAt
      }
    })

  } catch (error) {
    console.error('Official document upload error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload official document. Please try again.'
    }, { status: 500 })
  }
}