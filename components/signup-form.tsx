'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Zod validation schema
const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\d{9}$/, 'Phone number must be exactly 9 digits'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    console.log('=== FRONTEND SIGNUP DEBUG ===')
    console.log('Form data:', data)
    console.log('API endpoint: /api/Backend-user/singup')
    console.log('============================')
    
    try {
      const requestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        phoneNumber: data.phoneNumber,
        password: data.password
      }
      
      console.log('Sending request body:', requestBody)
      
      const response = await fetch('/api/Backend-user/singup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log('Response data:', result)

      if (result.success) {
        toast.success('Account created successfully!', {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          },
          position: 'top-right'
        })
        reset()
        
        setTimeout(() => {
          window.location.href = '/auth/users/user-login'
        }, 2000)
      } else {
        console.error('Registration failed:', result.message)
        toast.error(result.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={cn("flex flex-col gap-6 min-h-screen", className)} {...props}>
      <Card className="overflow-hidden p-0 min-h-screen">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-screen">
          {/* Left Column - Ministry Information */}
          <div 
            className="relative flex flex-col p-8 text-white"
            style={{
              backgroundImage: 'url(https://thumbs.dreamstime.com/b/concept-digital-government-e-shown-person-holding-interface-displays-various-icons-related-to-online-services-391473923.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Government Logo and Header - Moved to TOP */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <img
                    src="/images/logo1.png"
                    alt="Ministry of Health Logo"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Ministry of Health</h2>
                    <p className="text-sm text-gray-600">Federal Republic of Somalia</p>
                  </div>
                </div>
              </div>

              {/* Main Content - Centered */}
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <h1 className="text-2xl font-bold leading-tight">
                  Apply online for official Ministry of Health documents through the eHealth Service Portal.
                </h1>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold">Create an account</p>
                      <p className="text-sm opacity-90">select the required document, upload supporting documents, and track your application status online.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold">The Ministry reviews applications</p>
                      <p className="text-sm opacity-90">provides feedback if needed, issues approved documents, and securely archives them in the digital system.</p>
                    </div>
                  </div>
                </div>

                {/* Pagination dots */}
                <div className="flex gap-2 mt-6">
                  <div className="w-3 h-3 bg-cyan-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                </div>
              </div>

              {/* Accessibility Button - Bottom */}
              <div className="absolute bottom-6 left-6">
                <button className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <path d="M12 6a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 12 6zm0 4a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col justify-center p-8 bg-gray-50">
            {/* Health eServices Logo */}
            <div className="flex items-center justify-center mb-8">
              <img
                src="/images/logo1.png"
                alt="Health eServices Logo"
                className="max-w-[200px] max-h-[80px] w-auto h-auto object-contain"
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              </div>

              <FieldGroup className="space-y-4">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name *
                    </FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      {...register('firstName')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.firstName ? 'border-red-500' : ''
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      {...register('lastName')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.lastName ? 'border-red-500' : ''
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </Field>
                </div>

                {/* Username and Phone Number */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username *
                    </FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      {...register('username')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.username ? 'border-red-500' : ''
                      )}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Phone Number *
                    </FieldLabel>
                    <Input
                      id="phoneNumber"
                      type="number"
                      placeholder="Enter phone number"
                      {...register('phoneNumber')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.phoneNumber ? 'border-red-500' : ''
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </Field>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...register('password')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.password ? 'border-red-500' : ''
                      )}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password *
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      {...register('confirmPassword')}
                      className={cn(
                        "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        errors.confirmPassword ? 'border-red-500' : ''
                      )}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </Field>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Login link */}
                <div className="text-center">
                  <FieldDescription className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/auth/users/user-login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      Login
                    </a>
                  </FieldDescription>
                </div>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
