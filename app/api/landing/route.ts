import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Service } from '@/models/service'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all active services for the landing page
    const services = await Service.find({ isActive: true })
      .select('name description category fee requirements')
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      services,
      message: 'Services fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch services',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}