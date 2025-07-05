'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car, Users, Shield, Clock, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session) {
      // Redirect authenticated users to appropriate dashboard
      if (session.user.role === 'driver') {
        router.push('/driver/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Drive-N-Ride</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Your Journey, <span className="text-purple-400">Our Priority</span>
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Connect with reliable drivers and passengers for safe, convenient, and affordable rides. 
          Join thousands of users who trust Drive-N-Ride for their daily commute.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Start Riding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3">
              Become a Driver
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose Drive-N-Ride?
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-white">Trusted Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400 text-center">
                Connect with verified drivers and passengers in your area
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-white">Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400 text-center">
                All users are verified with background checks and ratings
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-white">24/7 Available</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400 text-center">
                Find rides anytime, anywhere with our round-the-clock service
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
                <Car className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-white">Multiple Options</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400 text-center">
                Choose from bikes, cars, or rickshaws based on your needs
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-slate-400">
              Join Drive-N-Ride today and experience the future of ride-sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3">
                  Already have an account?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400">
          <p>&copy; 2024 Drive-N-Ride. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}