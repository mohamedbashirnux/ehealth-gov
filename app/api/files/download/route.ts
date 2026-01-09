import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'
import { User } from '@/models/user'
import { Service } from '@/models/service'
import { Admin } from '@/models/admin'
import fs from 'fs'
import path from 'path'

// GET - Download file from MongoDB
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Ensure all models are registered
    const models = { Application, User, Service, Admin }
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const documentIndex = searchParams.get('documentIndex')
    const documentType = searchParams.get('type') || 'application' // 'application' or 'official'
    
    console.log('Download request:', { applicationId, documentIndex, documentType })
    
    if (!applicationId || documentIndex === null) {
      console.error('Missing required parameters:', { applicationId, documentIndex })
      return NextResponse.json({
        success: false,
        message: 'Application ID and document index are required'
      }, { status: 400 })
    }

    // Find the application
    const application = await Application.findById(applicationId)
    if (!application) {
      console.error('Application not found:', applicationId)
      return NextResponse.json({
        success: false,
        message: 'Application not found'
      }, { status: 404 })
    }

    console.log('Application found:', {
      id: application._id,
      documentsCount: application.documents?.length || 0,
      officialDocumentsCount: application.officialDocuments?.length || 0
    })

    // Get the document based on type
    const docIndex = parseInt(documentIndex)
    let document: any = null
    
    if (documentType === 'official') {
      // Handle official documents
      document = application.officialDocuments?.[docIndex]
      if (!document) {
        console.error('Official document not found at index:', docIndex)
        return NextResponse.json({
          success: false,
          message: 'Official document not found'
        }, { status: 404 })
      }
    } else {
      // Handle application documents
      document = application.documents?.[docIndex]
      if (!document) {
        console.error('Application document not found at index:', docIndex)
        return NextResponse.json({
          success: false,
          message: 'Application document not found'
        }, { status: 404 })
      }
    }

    console.log('Document found:', {
      fileName: document.fileName,
      fileSize: document.fileSize,
      hasFileData: !!document.fileData,
      hasFilePath: !!document.filePath
    })

    let buffer: Buffer

    // Check if document has Base64 data (new format)
    if (document.fileData) {
      console.log('Using Base64 data, length:', document.fileData.length)
      try {
        // Convert Base64 back to buffer
        buffer = Buffer.from(document.fileData, 'base64')
        console.log('Buffer created successfully, size:', buffer.length)
      } catch (error) {
        console.error('Error converting Base64 to buffer:', error)
        return NextResponse.json({
          success: false,
          message: 'Invalid file data format'
        }, { status: 500 })
      }
    } else if (document.filePath) {
      console.log('Using file path:', document.filePath)
      // Handle legacy file path format
      try {
        const fullPath = path.join(process.cwd(), 'uploads', document.filePath)
        console.log('Full file path:', fullPath)
        if (!fs.existsSync(fullPath)) {
          console.error('File not found on disk:', fullPath)
          return NextResponse.json({
            success: false,
            message: 'File not found on disk'
          }, { status: 404 })
        }
        buffer = fs.readFileSync(fullPath)
        console.log('File read successfully, size:', buffer.length)
      } catch (error) {
        console.error('Error reading file from disk:', error)
        return NextResponse.json({
          success: false,
          message: 'Failed to read file from disk'
        }, { status: 500 })
      }
    } else {
      console.error('No file data or path available')
      return NextResponse.json({
        success: false,
        message: 'File data not available'
      }, { status: 404 })
    }

    console.log('Sending file:', {
      fileName: document.fileName,
      fileType: document.fileType,
      bufferSize: buffer.length
    })

    // Return file with proper headers
    return new Response(buffer, {
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