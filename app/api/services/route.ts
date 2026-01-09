import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Service } from '@/models/service'

// GET - Show all services
export async function GET() {
  try {
    await connectDB()
    const services = await Service.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      services
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services'
    }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    console.log('Received service data:', body)
    
    const { name, description, category, requirements, fee } = body

    // Check if service already exists
    const existingService = await Service.findOne({ name })
    if (existingService) {
      return NextResponse.json({
        success: false,
        message: 'Service with this name already exists'
      }, { status: 400 })
    }

    // Create service data
    const serviceData = {
      name,
      description,
      category,
      requirements: requirements || [],
      fee: parseFloat(fee) || 0
    }

    console.log('Creating service with data:', serviceData)

    // Create new service
    const newService = new Service(serviceData)
    const savedService = await newService.save()

    console.log('Created service:', savedService)

    return NextResponse.json({
      success: true,
      message: 'Service created successfully!',
      service: savedService
    }, { status: 201 })

  } catch (error: any) {
    console.error('Service creation error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'Service name already exists'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Service creation failed. Please try again.'
    }, { status: 500 })
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { id, name, description, category, requirements, fee } = body

    // Check if service exists
    const existingService = await Service.findById(id)
    if (!existingService) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 })
    }

    // Check if name is being changed and if new name already exists
    if (name !== existingService.name) {
      const nameExists = await Service.findOne({ name, _id: { $ne: id } })
      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: 'Service with this name already exists'
        }, { status: 400 })
      }
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        requirements: requirements || [],
        fee: parseFloat(fee) || 0
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully!',
      service: updatedService
    })

  } catch (error: any) {
    console.error('Service update error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Service update failed. Please try again.'
    }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { id } = body

    const deletedService = await Service.findByIdAndDelete(id)
    
    if (!deletedService) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully!'
    })

  } catch (error) {
    console.error('Service deletion error:', error)
    return NextResponse.json({
      success: false,
      message: 'Service deletion failed. Please try again.'
    }, { status: 500 })
  }
}