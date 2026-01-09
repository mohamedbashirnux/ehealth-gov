import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Archive } from '@/models/archive'

// GET - Get archive records for reports (simplified, no populate)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const region = searchParams.get('region')
    const disease = searchParams.get('disease')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Build filter
    let filter: any = {}
    
    // Date range filter
    if (fromDate || toDate) {
      filter.archivedAt = {}
      if (fromDate) {
        filter.archivedAt.$gte = new Date(fromDate)
      }
      if (toDate) {
        const endDate = new Date(toDate)
        endDate.setHours(23, 59, 59, 999)
        filter.archivedAt.$lte = endDate
      }
    }
    
    // Region filter
    if (region && region !== 'all') {
      filter.patientRegion = region
    }
    
    // Disease filter
    if (disease && disease !== 'all') {
      filter.diseaseName = disease
    }

    // Get archive records (no populate to avoid model issues)
    const archives = await Archive.find(filter)
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalCount = await Archive.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      archives,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get archive reports error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch archive reports'
    }, { status: 500 })
  }
}