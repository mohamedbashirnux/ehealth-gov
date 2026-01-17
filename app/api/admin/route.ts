import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Admin } from '@/models/admin'
import bcrypt from 'bcryptjs'

// GET - Fetch all admins
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const admins = await Admin.find({})
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      admins
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch admins'
    }, { status: 500 })
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { fullname, phone, email, username, password, role, department } = body
    
    // Validate required fields
    if (!fullname || !phone || !email || !username || !password || !role || !department) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 })
    }
    
    // Validate role
    if (!['admin', 'super_admin', 'archive'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role. Must be admin, super_admin, or archive'
      }, { status: 400 })
    }
    
    // Check if email already exists
    const existingEmailAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingEmailAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Email already exists'
      }, { status: 400 })
    }
    
    // Check if username already exists
    const existingUsernameAdmin = await Admin.findOne({ username })
    if (existingUsernameAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Username already exists'
      }, { status: 400 })
    }
    
    // Validate fullname (8-50 characters, letters and spaces only)
    if (fullname.length < 8 || fullname.length > 50) {
      return NextResponse.json({
        success: false,
        message: 'Full name must be between 8 and 50 characters'
      }, { status: 400 })
    }
    
    if (!/^[a-zA-Z\s]+$/.test(fullname)) {
      return NextResponse.json({
        success: false,
        message: 'Full name can only contain letters and spaces'
      }, { status: 400 })
    }
    
    // Validate phone (8-15 digits)
    if (!/^\d{8,15}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Phone number must be 8-15 digits'
      }, { status: 400 })
    }
    
    // Validate username (5+ chars, must contain at least one number)
    if (username.length < 5) {
      return NextResponse.json({
        success: false,
        message: 'Username must be at least 5 characters'
      }, { status: 400 })
    }
    
    if (!/^(?=.*[0-9])[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({
        success: false,
        message: 'Username must contain at least one number and only letters, numbers, and underscores'
      }, { status: 400 })
    }
    
    // Validate password (8+ chars, must contain number and symbol)
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters'
      }, { status: 400 })
    }
    
    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one number and one symbol (!@#$%^&*)'
      }, { status: 400 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new admin
    const newAdmin = new Admin({
      fullname: fullname.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,
      role,
      department: department.trim()
    })
    
    await newAdmin.save()
    
    // Return admin without password
    const adminResponse = {
      _id: newAdmin._id,
      fullname: newAdmin.fullname,
      phone: newAdmin.phone,
      email: newAdmin.email,
      username: newAdmin.username,
      role: newAdmin.role,
      department: newAdmin.department,
      createdAt: newAdmin.createdAt
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: adminResponse
    })
    
  } catch (error: any) {
    console.error('Error creating admin:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        success: false,
        message: messages.join(', ')
      }, { status: 400 })
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({
        success: false,
        message: `${field} already exists`
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin'
    }, { status: 500 })
  }
}

// PUT - Update admin
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { id, fullname, phone, email, username, password, role, department } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Admin ID is required'
      }, { status: 400 })
    }
    
    // Find the admin
    const admin = await Admin.findById(id)
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found'
      }, { status: 404 })
    }
    
    // Validate required fields
    if (!fullname || !phone || !email || !username || !role || !department) {
      return NextResponse.json({
        success: false,
        message: 'All fields except password are required'
      }, { status: 400 })
    }
    
    // Validate role
    if (!['admin', 'super_admin', 'archive'].includes(role)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid role. Must be admin, super_admin, or archive'
      }, { status: 400 })
    }
    
    // Check if email already exists (excluding current admin)
    const existingEmailAdmin = await Admin.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: id }
    })
    if (existingEmailAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Email already exists'
      }, { status: 400 })
    }
    
    // Check if username already exists (excluding current admin)
    const existingUsernameAdmin = await Admin.findOne({ 
      username,
      _id: { $ne: id }
    })
    if (existingUsernameAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Username already exists'
      }, { status: 400 })
    }
    
    // Validate fullname
    if (fullname.length < 8 || fullname.length > 50) {
      return NextResponse.json({
        success: false,
        message: 'Full name must be between 8 and 50 characters'
      }, { status: 400 })
    }
    
    if (!/^[a-zA-Z\s]+$/.test(fullname)) {
      return NextResponse.json({
        success: false,
        message: 'Full name can only contain letters and spaces'
      }, { status: 400 })
    }
    
    // Validate phone
    if (!/^\d{8,15}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Phone number must be 8-15 digits'
      }, { status: 400 })
    }
    
    // Validate username
    if (username.length < 5) {
      return NextResponse.json({
        success: false,
        message: 'Username must be at least 5 characters'
      }, { status: 400 })
    }
    
    if (!/^(?=.*[0-9])[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({
        success: false,
        message: 'Username must contain at least one number and only letters, numbers, and underscores'
      }, { status: 400 })
    }
    
    // Prepare update data
    const updateData: any = {
      fullname: fullname.trim(),
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      role,
      department: department.trim()
    }
    
    // If password is provided, validate and hash it
    if (password && password.trim()) {
      if (password.length < 8) {
        return NextResponse.json({
          success: false,
          message: 'Password must be at least 8 characters'
        }, { status: 400 })
      }
      
      if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/.test(password)) {
        return NextResponse.json({
          success: false,
          message: 'Password must contain at least one number and one symbol (!@#$%^&*)'
        }, { status: 400 })
      }
      
      updateData.password = await bcrypt.hash(password, 12)
    }
    
    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: updatedAdmin
    })
    
  } catch (error: any) {
    console.error('Error updating admin:', error)
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        success: false,
        message: messages.join(', ')
      }, { status: 400 })
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({
        success: false,
        message: `${field} already exists`
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update admin'
    }, { status: 500 })
  }
}

// DELETE - Delete admin
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Admin ID is required'
      }, { status: 400 })
    }
    
    // Find and delete the admin
    const deletedAdmin = await Admin.findByIdAndDelete(id)
    
    if (!deletedAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete admin'
    }, { status: 500 })
  }
}