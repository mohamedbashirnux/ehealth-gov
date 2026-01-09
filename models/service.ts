import mongoose from 'mongoose'

// Service Model - For Ministry Services
const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Service name must be at least 3 characters'],
    maxlength: [100, 'Service name must be less than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must be less than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: {
      values: ['medical', 'administrative', 'emergency', 'consultation', 'referral', 'other'],
      message: 'Category must be one of: medical, administrative, emergency, consultation, referral, other'
    }
  },
  requirements: {
    type: [String],
    default: []
  },
  fee: {
    type: Number,
    required: [true, 'Service fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
})

// Force delete cached model and recreate it
if (mongoose.models.Service) {
  delete mongoose.models.Service
}

// Export Service Model
export const Service = mongoose.model('Service', ServiceSchema)