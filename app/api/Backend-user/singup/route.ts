import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongoose'
import { User } from '@/models/user'

// POST - Create new user (Registration)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('=== SIGNUP DEBUG ===')
    console.log('Received registration data:', body)
    console.log('API Route: /api/Backend-user/singup')
    console.log('===================')
    
    const { firstName, lastName, username, phoneNumber, password } = body

    // Validate required fields
    if (!firstName || !lastName || !username || !phoneNumber || !password) {
      console.log('Missing required fields:', { firstName: !!firstName, lastName: !!lastName, username: !!username, phoneNumber: !!phoneNumber, password: !!password })
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 })
    }

    console.log('Checking for existing user with username:', username, 'or phoneNumber:', phoneNumber)

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { phoneNumber }]
    })

    console.log('Existing user found:', existingUser ? 'YES' : 'NO')

    if (existingUser) {
      const conflictField = existingUser.username === username ? 'username' : 'phoneNumber'
      const message = existingUser.username === username 
        ? 'Username already taken' 
        : 'Phone number already registered'
      
      console.log('Conflict detected:', conflictField, '- Message:', message)
      
      return NextResponse.json({
        success: false,
        message: message
      }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user data
    const userData = {
      firstName,
      lastName,
      username,
      phoneNumber,
      password: hashedPassword
    }

    console.log('Creating user with data:', { ...userData, password: '[HASHED]' })

    // Create new user
    const newUser = new User(userData)
    const savedUser = await newUser.save()

    console.log('User created successfully:', { ...savedUser.toObject(), password: '[HIDDEN]' })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        username: savedUser.username,
        phoneNumber: savedUser.phoneNumber,
        createdAt: savedUser.createdAt
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('=== SIGNUP ERROR ===')
    console.error('Error details:', error)
    console.error('Error name:', error.name)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('==================')
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      console.log('Validation errors:', validationErrors)
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      console.log('Duplicate key error:', field, '- Message:', message)
      return NextResponse.json({
        success: false,
        message: message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Registration failed. Please try again.'
    }, { status: 500 })
  }
}

// GET - Get all users (for admin purposes)
export async function GET() {
  try {
    await connectDB()
    
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users'
    }, { status: 500 })
  }
}