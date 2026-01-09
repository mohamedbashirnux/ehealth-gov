import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'

// GET - Debug endpoint to check application document structure
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    if (!applicationId) {
      return NextResponse.json({
        success: false,
        message: 'Application ID is required'
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

    // Return application structure for debugging
    return NextResponse.json({
      success: true,
      data: {
        applicationId: application._id,
        status: application.status,
        documents: application.documents?.map((doc, index) => ({
          index,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          requirementType: doc.requirementType,
          hasFileData: !!doc.fileData,
          hasFilePath: !!doc.filePath,
          fileDataLength: doc.fileData ? doc.fileData.length : 0,
          filePath: doc.filePath || null
        })) || [],
        officialDocuments: application.officialDocuments?.map((doc, index) => ({
          index,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          documentType: doc.documentType,
          hasFileData: !!doc.fileData,
          hasFilePath: !!doc.filePath,
          fileDataLength: doc.fileData ? doc.fileData.length : 0,
          filePath: doc.filePath || null,
          uploadedBy: doc.uploadedBy,
          uploadedAt: doc.uploadedAt
        })) || []
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch application data'
    }, { status: 500 })
  }
}