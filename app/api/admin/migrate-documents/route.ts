import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Application } from '@/models/application'
import fs from 'fs'
import path from 'path'

// POST - Migrate official documents from file paths to Base64
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    console.log('Starting document migration...')
    
    // Find all applications with official documents that have filePath but no fileData
    const applications = await Application.find({
      'officialDocuments.filePath': { $exists: true },
      'officialDocuments.fileData': { $exists: false }
    })
    
    console.log(`Found ${applications.length} applications with documents to migrate`)
    
    let migratedCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    for (const application of applications) {
      console.log(`Processing application ${application._id}`)
      
      if (!application.officialDocuments) continue
      
      for (let i = 0; i < application.officialDocuments.length; i++) {
        const doc = application.officialDocuments[i]
        
        // Skip if already has fileData
        if (doc.fileData) continue
        
        // Skip if no filePath
        if (!doc.filePath) continue
        
        try {
          const fullPath = path.join(process.cwd(), 'uploads', doc.filePath)
          console.log(`Checking file: ${fullPath}`)
          
          if (fs.existsSync(fullPath)) {
            // Read file and convert to Base64
            const fileBuffer = fs.readFileSync(fullPath)
            const base64Data = fileBuffer.toString('base64')
            
            // Update the document with Base64 data
            application.officialDocuments[i].fileData = base64Data
            
            console.log(`Migrated document: ${doc.fileName}`)
            migratedCount++
          } else {
            console.error(`File not found: ${fullPath}`)
            errors.push(`File not found: ${doc.fileName} (${doc.filePath})`)
            errorCount++
          }
        } catch (error) {
          console.error(`Error processing ${doc.fileName}:`, error)
          errors.push(`Error processing ${doc.fileName}: ${error}`)
          errorCount++
        }
      }
      
      // Save the updated application
      if (migratedCount > 0) {
        await application.save()
        console.log(`Saved application ${application._id}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. ${migratedCount} documents migrated, ${errorCount} errors.`,
      details: {
        migratedCount,
        errorCount,
        errors: errors.slice(0, 10) // Limit to first 10 errors
      }
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Check migration status
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Count documents that need migration
    const needsMigration = await Application.countDocuments({
      'officialDocuments.filePath': { $exists: true },
      'officialDocuments.fileData': { $exists: false }
    })
    
    // Count documents that are already migrated
    const alreadyMigrated = await Application.countDocuments({
      'officialDocuments.fileData': { $exists: true }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        needsMigration,
        alreadyMigrated,
        totalWithOfficialDocs: needsMigration + alreadyMigrated
      }
    })
    
  } catch (error) {
    console.error('Migration status error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check migration status'
    }, { status: 500 })
  }
}