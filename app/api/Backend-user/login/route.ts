import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongoose'
import { User } from '@/models/user'

// POST - User login
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { identifier, password } = body // Changed from email to identifier

    // Find user by username or phone number
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { phoneNumber: identifier }
      ]
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username/phone number or password'
      }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid username/phone number or password'
      }, { status: 401 })
    }

    // Return user data (excluding password)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.'
    }, { status: 500 })
  }
}