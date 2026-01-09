import mongoose from 'mongoose'

// Archive Model - For recording approved medical referral letters
const ArchiveSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application ID is required'],
    unique: true // Each application can only be archived once
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required'],
    trim: true
  },
  patientRegion: {
    type: String,
    required: [true, 'Patient region is required'],
    trim: true
  },
  patientDistrict: {
    type: String,
    trim: true
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  medicalService: {
    type: String,
    required: [true, 'Medical service is required'],
    trim: true
  },
  referralReason: {
    type: String,
    required: [true, 'Referral reason is required'],
    trim: true,
    maxlength: [1000, 'Referral reason must be less than 1000 characters']
  },
  destinationCountry: {
    type: String,
    trim: true,
    maxlength: [100, 'Destination country must be less than 100 characters']
  },
  estimatedDuration: {
    type: String,
    trim: true,
    maxlength: [100, 'Estimated duration must be less than 100 characters']
  },
  officialDocumentPath: {
    type: String,
    required: [true, 'Official document path is required']
  },
  archiveNumber: {
    type: String,
    unique: true,
    required: true
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Archived by admin is required']
  },
  archivedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes must be less than 1000 characters']
  }
}, {
  timestamps: true
})

// Force delete cached model and recreate it
if (mongoose.models.Archive) {
  delete mongoose.models.Archive
}

// Export Archive Model
export const Archive = mongoose.model('Archive', ArchiveSchema)