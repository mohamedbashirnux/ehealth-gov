'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Zod validation schema
const createAdminSchema = (isEditing: boolean) => z.object({
  fullname: z.string()
    .min(8, 'Full name must be at least 8 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  phone: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^\d+$/, 'Phone number can only contain numbers'),
  email: z.string()
    .email('Please enter a valid email address'),
  username: z.string()
    .min(5, 'Username must be at least 5 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^(?=.*[0-9])[a-zA-Z0-9_]+$/, 'Username must contain at least one number and only letters, numbers, and underscores'),
  password: isEditing 
    ? z.string().optional().or(z.literal(''))
    : z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, 'Password must contain at least one number and one symbol (!@#$%^&*)'),
  role: z.enum(['admin', 'super_admin'], {
    message: 'Please select a valid role'
  }),
  department: z.string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department must be less than 50 characters')
})

type AdminFormData = z.infer<ReturnType<typeof createAdminSchema>>

interface Admin {
  _id?: string
  fullname?: string  // Optional for backward compatibility
  phone?: string     // Optional for backward compatibility
  email: string
  username: string
  role: 'admin' | 'super_admin'
  department: string
}

interface AdminFormProps {
  isOpen: boolean
  onClose: () => void
  editingAdmin?: Admin | null
  onSuccess?: () => void // Back to simple callback
}

export function AdminForm({ isOpen, onClose, editingAdmin, onSuccess }: AdminFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!editingAdmin

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<AdminFormData>({
    resolver: zodResolver(createAdminSchema(isEditing)),
    defaultValues: {
      fullname: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      role: 'admin' as const, // Default to admin with proper typing
      department: ''
    }
  })

  const watchedRole = watch('role')
  
  // Debug log to see what's happening with role
  useEffect(() => {
    console.log('Current watchedRole:', watchedRole)
    console.log('Current editingAdmin role:', editingAdmin?.role)
  }, [watchedRole, editingAdmin])

  // Reset form when dialog opens or editingAdmin changes
  useEffect(() => {
    if (isOpen) {
      const roleValue = (editingAdmin?.role as 'admin' | 'super_admin') || 'admin'
      console.log('Resetting form with role:', roleValue, 'editingAdmin:', editingAdmin) // Debug log
      
      reset({
        fullname: editingAdmin?.fullname || '',
        phone: editingAdmin?.phone || '',
        email: editingAdmin?.email || '',
        username: editingAdmin?.username || '',
        password: '',
        role: roleValue,
        department: editingAdmin?.department || ''
      })
      
      // Force set the role value after reset
      setTimeout(() => {
        setValue('role', roleValue)
        console.log('Force set role to:', roleValue) // Debug log
      }, 100)
    }
  }, [isOpen, editingAdmin, reset, setValue])

  const onSubmit = async (data: AdminFormData) => {
    setLoading(true)
    
    console.log('Form data being submitted:', data) // Debug log
    
    try {
      const url = '/api/admin'
      const method = editingAdmin ? 'PUT' : 'POST'
      const submitData = editingAdmin 
        ? { ...data, id: editingAdmin._id }
        : data

      // Don't send empty password for updates
      if (editingAdmin && !data.password) {
        delete submitData.password
      }

      console.log('Sending to API:', submitData) // Debug log

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      console.log('API response:', result) // Debug log
      
      if (result.success) {
        const message = editingAdmin ? 'Admin updated successfully!' : 'Admin added successfully!'
        
        // Close modal immediately
        onClose()
        
        // Show toast notification
        toast.success(message, {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          }
        })
        
        // Refresh admin list
        if (onSuccess) onSuccess()
      } else {
        toast.error('Error saving admin: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      toast.error('Failed to save admin')
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullname">Full Name</Label>
          <Input
            id="fullname"
            {...register('fullname')}
            disabled={loading}
            className={errors.fullname ? 'border-red-500' : ''}
          />
          {errors.fullname && (
            <p className="text-sm text-red-500">{errors.fullname.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            disabled={loading}
            className={errors.phone ? 'border-red-500' : ''}
            onInput={(e) => {
              // Only allow numbers
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/[^0-9]/g, '');
            }}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={loading}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register('username')}
            disabled={loading}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {editingAdmin && '(leave blank to keep current)'}
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            disabled={loading}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={watchedRole || ''}
            onValueChange={(value) => setValue('role', value as 'admin' | 'super_admin')}
            disabled={loading}
          >
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
              <SelectValue placeholder="Choose Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          {...register('department')}
          disabled={loading}
          className={errors.department ? 'border-red-500' : ''}
        />
        {errors.department && (
          <p className="text-sm text-red-500">{errors.department.message}</p>
        )}
      </div>
      
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
        </Button>
      </div>
    </form>
  )
}