'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Car, 
  Bike, 
  Truck, 
  MapPin, 
  Clock, 
  Star, 
  User, 
  Phone, 
  LogOut,
  Loader2,
  Navigation,
  Calendar,
  DollarSign,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'

type RideType = 'bike' | 'car' | 'rickshaw'
type RideStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Ride {
  id: string
  pickupLocation: string
  dropLocation: string
  distanceKm: number
  rideType: RideType
  fare: number
  discountedFare?: number
  status: RideStatus
  requestedAt: string
  driver?: {
    id: string
    name: string
    phone: string
  }
  rating?: number
}

export default function RiderDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Booking form state
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [rideType, setRideType] = useState<RideType>('car')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  
  // Rides state
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoadingRides, setIsLoadingRides] = useState(true)
  const [activeRide, setActiveRide] = useState<Ride | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session.user.role !== 'passenger') {
      router.push('/driver/dashboard')
      return
    }

    fetchRides()
  }, [session, status, router])

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides/passenger')
      if (response.ok) {
        const data = await response.json()
        setRides(data.rides || [])
        
        // Find active ride
        const active = data.rides?.find((ride: Ride) => 
          ride.status === 'requested' || ride.status === 'accepted' || ride.status === 'in_progress'
        )
        setActiveRide(active || null)
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setIsLoadingRides(false)
    }
  }

  const calculateFare = (distance: number, type: RideType): number => {
    const baseRates = {
      bike: { base: 30, perKm: 8 },
      car: { base: 50, perKm: 12 },
      rickshaw: { base: 25, perKm: 6 }
    }
    
    const rate = baseRates[type]
    return Math.round(rate.base + (distance * rate.perKm))
  }

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)
    setBookingError('')

    try {
      // Simulate distance calculation (in real app, use maps API)
      const estimatedDistance = Math.random() * 15 + 2 // 2-17 km
      const fare = calculateFare(estimatedDistance, rideType)

      const response = await fetch('/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLocation,
          dropLocation,
          rideType,
          distanceKm: estimatedDistance,
          fare
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setBookingError(data.message || 'Failed to book ride')
        return
      }

      // Clear form and refresh rides
      setPickupLocation('')
      setDropLocation('')
      setRideType('car')
      fetchRides()
      
    } catch (error) {
      setBookingError('Something went wrong')
    } finally {
      setIsBooking(false)
    }
  }

  const cancelRide = async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchRides()
      }
    } catch (error) {
      console.error('Error cancelling ride:', error)
    }
  }

  const getRideTypeIcon = (type: RideType) => {
    switch (type) {
      case 'bike': return <Bike className="h-5 w-5" />
      case 'car': return <Car className="h-5 w-5" />
      case 'rickshaw': return <Truck className="h-5 w-5" />
      default: return <Car className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: RideStatus) => {
    switch (status) {
      case 'requested': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20'
      case 'accepted': return 'bg-blue-900/20 text-blue-400 border-blue-500/20'
      case 'in_progress': return 'bg-purple-900/20 text-purple-400 border-purple-500/20'
      case 'completed': return 'bg-green-900/20 text-green-400 border-green-500/20'
      case 'cancelled': return 'bg-red-900/20 text-red-400 border-red-500/20'
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/20'
    }
  }

  if (status === 'loading' || isLoadingRides) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Drive-N-Ride</h1>
                <p className="text-sm text-slate-400">Rider Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-white">{session?.user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Book Ride Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-purple-400" />
                  Book a Ride
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your pickup and drop locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingError && (
                  <Alert className="mb-4 bg-red-900/20 border-red-500/20">
                    <AlertDescription className="text-red-400">
                      {bookingError}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleBookRide} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickup" className="text-slate-300">
                        Pickup Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-4 w-4" />
                        <Input
                          id="pickup"
                          type="text"
                          placeholder="Enter pickup location"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drop" className="text-slate-300">
                        Drop Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-4 w-4" />
                        <Input
                          id="drop"
                          type="text"
                          placeholder="Enter drop location"
                          value={dropLocation}
                          onChange={(e) => setDropLocation(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Vehicle Type</Label>
                    <Select value={rideType} onValueChange={(value: RideType) => setRideType(value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="bike" className="text-white hover:bg-slate-700">
                          <div className="flex items-center space-x-2">
                            <Bike className="h-4 w-4" />
                            <span>Bike - Fast & Economical</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="car" className="text-white hover:bg-slate-700">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Car - Comfortable & Safe</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="rickshaw" className="text-white hover:bg-slate-700">
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4" />
                            <span>Rickshaw - Budget Friendly</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isBooking || !!activeRide}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking Ride...
                      </>
                    ) : activeRide ? (
                      'You have an active ride'
                    ) : (
                      'Book Ride'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Ride Section */}
          <div>
            {activeRide && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-purple-400" />
                      Active Ride
                    </span>
                    <Badge className={getStatusColor(activeRide.status)}>
                      {activeRide.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getRideTypeIcon(activeRide.rideType)}
                    <span className="text-white capitalize">{activeRide.rideType}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-400">Pickup</p>
                        <p className="text-white text-sm">{activeRide.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-400">Drop</p>
                        <p className="text-white text-sm">{activeRide.dropLocation}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-400">Distance</p>
                      <p className="text-white">{activeRide.distanceKm.toFixed(1)} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Fare</p>
                      <p className="text-white font-bold">Rs.{activeRide.fare}</p>
                    </div>
                  </div>

                  {activeRide.driver && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Driver Details</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-purple-400" />
                            <span className="text-white">{activeRide.driver.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-purple-400" />
                            <span className="text-white">{activeRide.driver.phone}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeRide.status === 'requested' && (
                    <Button
                      onClick={() => cancelRide(activeRide.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Ride
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Rides */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Recent Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rides.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No rides yet. Book your first ride!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.slice(0, 5).map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getRideTypeIcon(ride.rideType)}
                      <div>
                        <p className="text-white font-medium">
                          {ride.pickupLocation} → {ride.dropLocation}
                        </p>
                        <p className="text-sm text-slate-400">
                          {new Date(ride.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(ride.status)}>
                        {ride.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-right">
                        <p className="text-white font-bold">Rs.{ride.fare}</p>
                        {ride.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-sm text-slate-400">{ride.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}