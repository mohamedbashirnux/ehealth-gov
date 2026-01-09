'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Zod validation schema
const serviceSchema = z.object({
  name: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  category: z
    .string()
    .min(1, 'Please select a category'),
  requirements: z
    .string()
    .optional(),
  fee: z
    .string()
    .min(1, 'Fee is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Fee must be a valid number')
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  editingService?: any
  onSuccess: () => void
}

export function ServiceForm({ isOpen, onClose, editingService, onSuccess }: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema)
  })

  // Set form values when editing
  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        // Editing existing service
        setValue('name', editingService.name || '')
        setValue('description', editingService.description || '')
        setValue('category', editingService.category || '')
        setValue('requirements', editingService.requirements?.join('\n') || '')
        setValue('fee', editingService.fee?.toString() || '0')
      } else {
        // Adding new service - reset to empty values
        reset({
          name: '',
          description: '',
          category: '',
          requirements: '',
          fee: '0'
        })
      }
    }
  }, [isOpen, editingService, setValue, reset])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true)
    
    try {
      const serviceData = {
        ...data,
        requirements: data.requirements 
          ? data.requirements.split(/[\n,]/).map(req => req.trim()).filter(req => req) 
          : [],
        fee: parseFloat(data.fee)
      }

      const url = '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      const body = editingService 
        ? { id: editingService._id, ...serviceData }
        : serviceData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          },
          position: 'top-right'
        })
        reset()
        onClose()
        onSuccess()
      } else {
        toast.error(result.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Service operation error:', error)
      toast.error('Operation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Service Name</label>
          <Input
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Requirements</label>
          <Textarea
            {...register('requirements')}
            className={errors.requirements ? 'border-red-500' : ''}
            rows={3}
            placeholder="Enter requirements (one per line or comma separated)"
          />
          {errors.requirements && (
            <p className="text-sm text-red-500 mt-1">{errors.requirements.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fee (USD)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('fee')}
            className={errors.fee ? 'border-red-500' : ''}
          />
          {errors.fee && (
            <p className="text-sm text-red-500 mt-1">{errors.fee.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
}