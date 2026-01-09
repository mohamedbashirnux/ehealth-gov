import mongoose from 'mongoose'

// Application Model - For User Service Applications
const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name must be less than 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{9}$/, 'Phone number must be exactly 9 digits']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true,
    enum: [
      'Awdal', 'Woqooyi Galbeed', 'Togdheer', 'Sool', 'Sanaag', 'Marodijeh',
      'Bari', 'Nugaal', 'Mudug', 'Galguduud', 'Hiiraan', 'Shabeellaha Dhexe',
      'Banaadir', 'Shabeellaha Hoose', 'Bay', 'Bakool', 'Gedo', 'Jubbada Hoose', 'Jubbada Dhexe'
    ]
  },
  district: {
    type: String,
    trim: true,
    maxlength: [100, 'District must be less than 100 characters']
  },
  reasonForMedicalLetter: {
    type: String,
    required: [true, 'Reason for medical letter is required'],
    enum: [
      'Cancer (Oncology)',
      'Cardiac Diseases',
      'Kidney Diseases',
      'Neurological & Neurosurgical Conditions',
      'Orthopedic & Trauma Surgery',
      'Pediatric Specialized Care',
      'Advanced Diagnostic Services',
      'Infertility & Reproductive Health',
      'Ophthalmology (Advanced Eye Care)',
      'Burns & Plastic / Reconstructive Surgery',
      'Other'
    ],
    trim: true
  },
  otherReasonForMedicalLetter: {
    type: String,
    trim: true,
    maxlength: [500, 'Other reason must be less than 500 characters']
  },
  reasonForApplication: {
    type: String,
    trim: true,
    default: 'Service application request',
    maxlength: [1000, 'Reason must be less than 1000 characters']
  },
  documents: [{
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    requirementType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  officialDocuments: [{
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    documentType: {
      type: String,
      required: true,
      default: 'Official Document'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes must be less than 1000 characters']
  },
  applicationNumber: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
})

// Force delete cached model and recreate it
if (mongoose.models.Application) {
  delete mongoose.models.Application
}

// Export Application Model
export const Application = mongoose.model('Application', ApplicationSchema)