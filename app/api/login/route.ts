import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Admin } from '@/models/admin'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const { username, password } = await request.json()
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Username and password are required' 
        },
        { status: 400 }
      )
    }
    
    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase() })
    
    if (!admin) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid username or password' 
        },
        { status: 401 }
      )
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Account is deactivated. Contact administrator.' 
        },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid username or password' 
        },
        { status: 401 }
      )
    }
    
    // Login successful
    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        department: admin.department
      }
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Server error. Please try again later.' 
      },
      { status: 500 }
    )
  }
}