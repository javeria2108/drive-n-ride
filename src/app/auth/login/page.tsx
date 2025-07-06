'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Car, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { z } from 'zod'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<LoginInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // ✅ Handle message from signup and session redirect
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccessMessage(message)
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'driver') {
        router.push('/driver/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [searchParams, status, session, router])

  const handleInputChange = (field: keyof LoginInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setLoginError('')

    try {
      const validatedData = loginSchema.parse(formData)

      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      if (result?.error) {
        setLoginError('Invalid email or password')
        return
      }

      if (result?.ok) {
        // Let useSession() take over and redirect in the next render cycle
        router.refresh() // Optional: force re-fetch session
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginInput> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof LoginInput
          fieldErrors[path] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setLoginError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Car className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Drive-N-Ride</h1>
          </div>
          <p className="text-slate-400">Welcome back! Sign in to continue</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-900/20 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {loginError && (
              <Alert className="bg-red-900/20 border-red-500/20">
                <AlertDescription className="text-red-400">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500"
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-300">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400 text-center">Quick demo access:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      email: 'demo.passenger@example.com',
                      password: 'demo123456'
                    })
                  }}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Demo Passenger
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      email: 'demo.driver@example.com',
                      password: 'demo123456'
                    })
                  }}
                  className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Demo Driver
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
