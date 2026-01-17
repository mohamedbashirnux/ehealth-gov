import mongoose from 'mongoose'

// Admin Model - Ministry Staff
const AdminSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    maxlength: 50
  },

  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{8,15}$/
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    match: /^(?=.*[0-9])[a-zA-Z0-9_]+$/
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },

  // 🔥 ROLE MUST BE CHOSEN EXPLICITLY
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['admin', 'super_admin', 'archive'],
      message: 'Role must be admin, super_admin, or archive'
    }
  },

  department: {
    type: String,
    required: true,
    trim: true
  }

}, {
  timestamps: true
})

export const Admin =
  mongoose.models.Admin || mongoose.model('Admin', AdminSchema)
