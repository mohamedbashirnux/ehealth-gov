import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI
    }, { status: 500 })
  }
}