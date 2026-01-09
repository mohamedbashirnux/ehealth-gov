import mongoose from 'mongoose'

// Admin Model - ONLY for Ministry Staff
const AdminSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [8, 'Full name must be at least 8 characters'],
    maxlength: [50, 'Full name must be less than 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{8,15}$/, 'Phone number must be 8-15 digits only']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [5, 'Username must be at least 5 characters'],
    match: [/^(?=.*[0-9])[a-zA-Z0-9_]+$/, 'Username must contain at least one number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'super_admin'],
      message: 'Role must be either admin or super_admin'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
})

// Export Admin Model
export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)