import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Admin } from '@/models/admin'
import bcrypt from 'bcryptjs'

// POST - Admin Login
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { username, password } = body
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 })
    }

    // Find admin by username
    const admin = await Admin.findOne({ username })
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 })
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Account is deactivated. Please contact system administrator.'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 })
    }

    // Return admin data (without password)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        isActive: admin.isActive
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.'
    }, { status: 500 })
  }
}