'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// Update the import path if the Button component is located elsewhere, for example:
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Car, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'
import { z } from 'zod'

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupInput>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'passenger' as const,
  })
  const [errors, setErrors] = useState<Partial<SignupInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const router = useRouter()

  const handleInputChange = (field: keyof SignupInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setSubmitError('')

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formData)

      // Submit to API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setSubmitError(data.message || 'Something went wrong')
        }
        return
      }

      // Success - redirect to login
      router.push('/auth/login?message=Account created successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<SignupInput> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof SignupInput
          if (path === 'role') {
            // Only assign error message if it matches the expected type
            fieldErrors.role = undefined
          } else {
            // Assign error message for string fields
            fieldErrors[path] = err.message as any
          }
        })
        setErrors(fieldErrors)
      } else {
        setSubmitError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Car className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Drive-N-Ride</h1>
          </div>
          <p className="text-slate-400">Join the ride-sharing revolution</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitError && (
              <Alert className="bg-red-900/20 border-red-500/20">
                <AlertDescription className="text-red-400">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-400">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-slate-300">I want to</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'passenger' | 'driver') => handleInputChange('role', value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="passenger" className="text-white hover:bg-slate-700">
                      Book rides as a passenger
                    </SelectItem>
                    <SelectItem value="driver" className="text-white hover:bg-slate-700">
                      Drive and earn money
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-400">{errors.role}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}