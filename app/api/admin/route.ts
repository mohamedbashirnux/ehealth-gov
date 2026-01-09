import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Admin } from '@/models/admin'  // Direct import
import bcrypt from 'bcryptjs'

// GET - Show all admins
export async function GET() {
  try {
    await connectDB()
    const admins = await Admin.find({}, { password: 0 }).sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      admins: admins
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new admin
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    console.log('Received data:', body) // Debug log
    
    const { fullname, phone, email, username, password, role, department } = body
    
    // Validate required fields
    if (!fullname || !phone || !email || !username || !password || !role || !department) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const adminData = {
      fullname,
      phone,
      email,
      username,
      password: hashedPassword,
      role,
      department
    }
    
    console.log('Creating admin with data:', adminData) // Debug log
    
    const admin = await Admin.create(adminData)
    
    console.log('Created admin:', admin) // Debug log
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        phone: admin.phone,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        department: admin.department
      }
    })
  } catch (error: any) {
    console.error('Error creating admin:', error) // Debug log
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}

// PUT - Edit admin
export async function PUT(request: Request) {
  try {
    await connectDB()
    const { id, fullname, phone, email, username, role, department, password } = await request.json()
    
    const updateData: any = { fullname, phone, email, username, role, department }
    
    // Only hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }
    
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true })
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin._id,
        fullname: admin.fullname,
        phone: admin.phone,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        department: admin.department
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}

// DELETE - Delete admin
export async function DELETE(request: Request) {
  try {
    await connectDB()
    const { id } = await request.json()
    
    await Admin.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}