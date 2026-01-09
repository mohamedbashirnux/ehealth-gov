import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User } from '@/models/user'

// GET - Debug: Check all users in database
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    console.log('=== USER DEBUG INFO ===')
    
    // Get all users (without passwords)
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 })
    
    console.log('Total users found:', users.length)
    console.log('Users:', users)
    
    // Check database collection info
    const collection = User.collection
    const indexes = await collection.indexes()
    
    console.log('Collection name:', collection.collectionName)
    console.log('Indexes:', indexes)
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users,
      collectionName: collection.collectionName,
      indexes: indexes
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug failed',
      error: error.message
    }, { status: 500 })
  }
}

// DELETE - Debug: Clear all users (BE CAREFUL!)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')
    
    if (confirm !== 'yes-delete-all-users') {
      return NextResponse.json({
        success: false,
        message: 'Add ?confirm=yes-delete-all-users to confirm deletion'
      }, { status: 400 })
    }
    
    const result = await User.deleteMany({})
    
    console.log('Deleted users:', result.deletedCount)
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} users`,
      deletedCount: result.deletedCount
    })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({
      success: false,
      message: 'Delete failed',
      error: error.message
    }, { status: 500 })
  }
}