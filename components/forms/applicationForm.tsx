'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"

// Somali regions
const SOMALI_REGIONS = [
  'Awdal', 'Woqooyi Galbeed', 'Togdheer', 'Sool', 'Sanaag', 'Marodijeh',
  'Bari', 'Nugaal', 'Mudug', 'Galguduud', 'Hiiraan', 'Shabeellaha Dhexe',
  'Banaadir', 'Shabeellaha Hoose', 'Bay', 'Bakool', 'Gedo', 'Jubbada Hoose', 'Jubbada Dhexe'
]

interface Service {
  _id: string
  name: string
  description: string
  category: string
  requirements: string[]
  fee: number
  isActive: boolean
}

interface UserData {
  id: string
  firstName: string
  lastName: string
  username: string
  phoneNumber: string
}

interface ApplicationFormProps {
  service: Service
  user: UserData
  onClose: () => void
  onSuccess: () => void
}

// Medical reasons for letter
const MEDICAL_REASONS = [
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
] as const

// Zod validation schema
const applicationSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{9}$/, 'Phone number must be exactly 9 digits'),
  region: z
    .string()
    .min(1, 'Region is required'),
  district: z
    .string()
    .optional(),
  reasonForMedicalLetter: z
    .string()
    .min(1, 'Reason for medical letter is required'),
  otherReasonForMedicalLetter: z
    .string()
    .optional()
}).refine((data) => {
  // If "Other" is selected, otherReasonForMedicalLetter must be provided
  if (data.reasonForMedicalLetter === 'Other') {
    return data.otherReasonForMedicalLetter && data.otherReasonForMedicalLetter.trim().length > 0
  }
  return true
}, {
  message: 'Please specify the reason when "Other" is selected',
  path: ['otherReasonForMedicalLetter']
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface UploadedFile {
  file: File
  requirementType: string
  preview?: string
}

export function ApplicationForm({ service, user, onClose, onSuccess }: ApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedMedicalReason, setSelectedMedicalReason] = useState<string>('')
  const [showOtherReason, setShowOtherReason] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber
    }
  })

  const watchedMedicalReason = watch('reasonForMedicalLetter')

  // Check for existing application
  const checkExistingApplication = async () => {
    try {
      const response = await fetch(`/api/applications/check?userId=${user.id}&serviceId=${service._id}`)
      const result = await response.json()
      return result.hasActiveApplication
    } catch (error) {
      console.error('Error checking existing application:', error)
      return false
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      medical: 'bg-blue-100 text-blue-800',
      administrative: 'bg-gray-100 text-gray-800',
      emergency: 'bg-red-100 text-red-800',
      consultation: 'bg-green-100 text-green-800',
      referral: 'bg-purple-100 text-purple-800',
      other: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, requirementType: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, PDF, DOC, DOCX files are allowed')
      return
    }

    // Remove existing file for this requirement type
    setUploadedFiles(prev => prev.filter(f => f.requirementType !== requirementType))

    // Add new file
    const newFile: UploadedFile = {
      file,
      requirementType,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }

    setUploadedFiles(prev => [...prev, newFile])
    toast.success(`${file.name} uploaded successfully`)
  }

  const removeFile = (requirementType: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.requirementType === requirementType)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.requirementType !== requirementType)
    })
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true)
    
    try {
      console.log('Form data being submitted:', data) // Debug log
      
      // Check for existing active application
      const hasActiveApplication = await checkExistingApplication()
      if (hasActiveApplication) {
        toast.error('You already have an active application for this service. Please wait for it to be processed.')
        setIsLoading(false)
        return
      }

      // Validate that doctor's diagnosis document is uploaded
      const doctorDiagnosisFile = uploadedFiles.find(f => 
        f.requirementType.toLowerCase().includes('doctor') || 
        f.requirementType.toLowerCase().includes('diagnosis')
      )
      
      if (!doctorDiagnosisFile) {
        toast.error('Please upload the required doctor\'s diagnosis or recommendation letter')
        setIsLoading(false)
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      
      // Add form data
      formData.append('userId', user.id)
      formData.append('serviceId', service._id)
      formData.append('fullName', data.fullName)
      formData.append('phoneNumber', data.phoneNumber)
      formData.append('region', data.region)
      if (data.district) {
        formData.append('district', data.district)
      }
      formData.append('reasonForMedicalLetter', data.reasonForMedicalLetter)
      if (data.otherReasonForMedicalLetter) {
        formData.append('otherReasonForMedicalLetter', data.otherReasonForMedicalLetter)
      }
      
      console.log('FormData contents:') // Debug log
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }
      
      // Add files
      uploadedFiles.forEach((uploadedFile) => {
        formData.append(`documents`, uploadedFile.file)
        formData.append(`requirementTypes`, uploadedFile.requirementType)
      })

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Application submitted successfully!', {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          },
          position: 'top-right'
        })
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || 'Application submission failed')
      }
    } catch (error) {
      console.error('Application submission error:', error)
      toast.error('Application submission failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      {/* Service Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Service Details</h3>
        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
        <div className="flex items-center justify-start">
          <Badge className={getCategoryColor(service.category)}>
            {service.category}
          </Badge>
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <Input 
            {...register('fullName')}
            placeholder="Enter your full name"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <Input 
            {...register('phoneNumber')}
            type="tel"
            placeholder="Enter your phone number"
            className={errors.phoneNumber ? 'border-red-500' : ''}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9]/g, '');
            }}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Region *</label>
          <Select onValueChange={(value) => {
            setValue('region', value)
          }}>
            <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your region" />
            </SelectTrigger>
            <SelectContent>
              {SOMALI_REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.region && (
            <p className="text-sm text-red-500 mt-1">{errors.region.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">District (Optional)</label>
          <Input 
            {...register('district')}
            placeholder="Enter your district (optional)"
            className={errors.district ? 'border-red-500' : ''}
          />
          {errors.district && (
            <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>
          )}
        </div>

        {/* Reason for Medical Letter */}
        <div>
          <label className="block text-sm font-medium mb-2">Reason for Medical Letter (Service Not Available Locally) *</label>
          <Select 
            onValueChange={(value) => {
              setSelectedMedicalReason(value)
              setShowOtherReason(value === 'Other')
              setValue('reasonForMedicalLetter', value, { shouldValidate: true })
            }}
            value={watchedMedicalReason}
          >
            <SelectTrigger className={errors.reasonForMedicalLetter ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select reason for medical letter" />
            </SelectTrigger>
            <SelectContent>
              {MEDICAL_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.reasonForMedicalLetter && (
            <p className="text-sm text-red-500 mt-1">{errors.reasonForMedicalLetter.message}</p>
          )}
        </div>

        {/* Other Reason Text Box */}
        {(showOtherReason || watchedMedicalReason === 'Other') && (
          <div>
            <label className="block text-sm font-medium mb-2">Write the reason for medical letter *</label>
            <Textarea 
              {...register('otherReasonForMedicalLetter', {
                required: watchedMedicalReason === 'Other' ? 'Please specify the reason' : false
              })}
              placeholder="Please specify the reason for medical letter..."
              className={errors.otherReasonForMedicalLetter ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.otherReasonForMedicalLetter && (
              <p className="text-sm text-red-500 mt-1">{errors.otherReasonForMedicalLetter.message}</p>
            )}
          </div>
        )}

        {/* Document Upload Section - Only Doctor's Diagnosis */}
        <div>
          <label className="block text-sm font-medium mb-2">Required Document</label>
          <div className="space-y-3">
            {(() => {
              const requirementType = "Doctor's diagnosis or recommendation letter"
              const uploadedFile = uploadedFiles.find(f => f.requirementType === requirementType)
              
              return (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">{requirementType} *</div>
                  
                  {uploadedFile ? (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700">{uploadedFile.file.name}</span>
                        <span className="text-xs text-green-600">
                          ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(requirementType)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="flex space-x-2 mb-2">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <FileText className="w-6 h-6 text-gray-400" />
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF, DOC, DOCX (MAX. 10MB)
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, requirementType)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="w-full sm:flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </div>
  )
}