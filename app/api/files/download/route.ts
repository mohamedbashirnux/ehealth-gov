import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'

// GET - Download file from MongoDB
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const documentIndex = searchParams.get('documentIndex')
    
    if (!applicationId || documentIndex === null) {
      return NextResponse.json({
        success: false,
        message: 'Application ID and document index are required'
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

    // Get the document
    const docIndex = parseInt(documentIndex)
    const document = application.documents[docIndex]
    
    if (!document) {
      return NextResponse.json({
        success: false,
        message: 'Document not found'
      }, { status: 404 })
    }

    // Check if document has Base64 data
    if (!document.fileData) {
      return NextResponse.json({
        success: false,
        message: 'File data not available'
      }, { status: 404 })
    }

    // Convert Base64 back to buffer
    const buffer = Buffer.from(document.fileData, 'base64')
    
    // Return file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': document.fileType,
        'Content-Length': document.fileSize.toString(),
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
      },
    })

  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to download file'
    }, { status: 500 })
  }
}