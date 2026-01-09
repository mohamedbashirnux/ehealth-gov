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

// Zod validation schema for login
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Username or phone number is required')
    .refine((value) => {
      // Check if it's a valid phone number (9 digits) or username (3+ chars)
      const isPhoneNumber = /^\d{9}$/.test(value)
      const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value)
      return isPhoneNumber || isUsername
    }, 'Enter a valid username or 9-digit phone number'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/Backend-user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password
        })
      })

      const result = await response.json()

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user))
        
        toast.success('Login successful!', {
          style: {
            background: '#10b981',
            color: 'white',
            border: 'none'
          },
          position: 'top-right'
        })
        
        // Redirect to user dashboard
        setTimeout(() => {
          window.location.href = '/user-dashboard'
        }, 1000)
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Network error. Please try again.')
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
                  Welcome back to the Ministry of Health Electronic Health Services Portal
                </h1>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold">Secure Access</p>
                      <p className="text-sm opacity-90">Login with your username or phone number to access your account and track your applications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold">Digital Services</p>
                      <p className="text-sm opacity-90">Access all Ministry of Health services, submit applications, and manage your documents online.</p>
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

          {/* Right Column - Login Form */}
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
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Login to your Ministry of Health account</p>
              </div>

              <FieldGroup className="space-y-4">
                {/* Username or Phone Number */}
                <Field>
                  <FieldLabel htmlFor="identifier" className="text-sm font-medium text-gray-700">
                    Username or Phone Number *
                  </FieldLabel>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter username or phone number"
                    {...register('identifier')}
                    className={cn(
                      "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                      errors.identifier ? 'border-red-500' : ''
                    )}
                  />
                  {errors.identifier && (
                    <p className="text-sm text-red-500 mt-1">{errors.identifier.message}</p>
                  )}
                </Field>

                {/* Password */}
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

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                {/* Sign up link */}
                <div className="text-center">
                  <FieldDescription className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/auth/users/signup" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                      Create Account
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