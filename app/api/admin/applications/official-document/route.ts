import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST - Admin uploads official document for approved application
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const formData = await request.formData()
    
    // Extract form fields
    const applicationId = formData.get('applicationId') as string
    const adminId = formData.get('adminId') as string
    const officialDocument = formData.get('officialDocument') as File
    
    // Validate required fields
    if (!applicationId || !adminId || !officialDocument) {
      return NextResponse.json({
        success: false,
        message: 'Application ID, Admin ID, and official document are required'
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'official-documents')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${officialDocument.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filepath = join(uploadsDir, filename)
    
    // Save file
    const bytes = await officialDocument.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Add official document to application
    const officialDocumentData = {
      fileName: officialDocument.name,
      fileType: officialDocument.type,
      fileSize: officialDocument.size,
      filePath: `/uploads/official-documents/${filename}`,
      documentType: 'Official Document',
      uploadedAt: new Date(),
      uploadedBy: 'admin'
    }

    // Update application with official document and change status to completed
    await Application.findByIdAndUpdate(
      applicationId,
      { 
        $push: { officialDocuments: officialDocumentData },
        status: 'completed' // Change status to completed when admin uploads official document
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Official document uploaded successfully. Application status updated to completed.',
      document: officialDocumentData
    })

  } catch (error) {
    console.error('Admin official document upload error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to upload official document. Please try again.'
    }, { status: 500 })
  }
}