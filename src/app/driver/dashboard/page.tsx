'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity
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
  passenger: {
    id: string
    name: string
    phone: string
  }
  rating?: number
}

interface DriverStats {
  totalRides: number
  totalEarnings: number
  averageRating: number
  todayRides: number
  todayEarnings: number
}

export default function DriverDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Driver state
  const [isOnline, setIsOnline] = useState(false)
  const [rides, setRides] = useState<Ride[]>([])
  const [availableRides, setAvailableRides] = useState<Ride[]>([])
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [stats, setStats] = useState<DriverStats>({
    totalRides: 0,
    totalEarnings: 0,
    averageRating: 0,
    todayRides: 0,
    todayEarnings: 0
  })
  
  // Loading states
  const [isLoadingRides, setIsLoadingRides] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [processingRides, setProcessingRides] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session.user.role !== 'driver') {
      router.push('/dashboard')
      return
    }

    fetchRides()
    fetchStats()
    
    // Poll for new rides when online
    const interval = setInterval(() => {
      if (isOnline) {
        fetchAvailableRides()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [session, status, router, isOnline])

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides/driver')
      if (response.ok) {
        const data = await response.json()
        setRides(data.rides || [])
        
        // Find active ride
        const active = data.rides?.find((ride: Ride) => 
          ride.status === 'accepted' || ride.status === 'in_progress'
        )
        setActiveRide(active || null)
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setIsLoadingRides(false)
    }
  }

  const fetchAvailableRides = async () => {
    try {
      const response = await fetch('/api/rides/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableRides(data.rides || [])
      }
    } catch (error) {
      console.error('Error fetching available rides:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/rides/driver/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleOnlineToggle = async (online: boolean) => {
    setIsOnline(online)
    
    if (online) {
      fetchAvailableRides()
    } else {
      setAvailableRides([])
    }
  }

  const acceptRide = async (rideId: string) => {
    if (activeRide) {
      alert('You already have an active ride')
      return
    }

    setProcessingRides(prev => new Set(prev).add(rideId))
    
    try {
      const response = await fetch(`/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchRides()
        fetchAvailableRides()
        fetchStats()
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to accept ride')
      }
    } catch (error) {
      console.error('Error accepting ride:', error)
      alert('Something went wrong')
    } finally {
      setProcessingRides(prev => {
        const newSet = new Set(prev)
        newSet.delete(rideId)
        return newSet
      })
    }
  }

  const rejectRide = async (rideId: string) => {
    setProcessingRides(prev => new Set(prev).add(rideId))
    
    try {
      const response = await fetch(`/api/rides/${rideId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        fetchAvailableRides()
      }
    } catch (error) {
      console.error('Error rejecting ride:', error)
    } finally {
      setProcessingRides(prev => {
        const newSet = new Set(prev)
        newSet.delete(rideId)
        return newSet
      })
    }
  }

  const updateRideStatus = async (rideId: string, status: RideStatus) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchRides()
        fetchStats()
      }
    } catch (error) {
      console.error('Error updating ride status:', error)
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
                <p className="text-sm text-slate-400">Driver Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="online-toggle" className="text-white">
                  {isOnline ? 'Online' : 'Offline'}
                </Label>
                <Switch
                  id="online-toggle"
                  checked={isOnline}
                  onCheckedChange={handleOnlineToggle}
                />
              </div>
              
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span>{session?.user?.name || 'Driver'}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Total Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalRides}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats.totalEarnings.toFixed(2)}`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.averageRating.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Today's Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.todayRides}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${stats.todayEarnings.toFixed(2)}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Ride Alert */}
        {activeRide && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              You have an active ride in progress. Complete it before accepting new rides.
            </AlertDescription>
          </Alert>
        )}

        {/* Online Status Alert */}
        {!isOnline && (
          <Alert className="mb-6 bg-yellow-900/20 border-yellow-500/20">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              You are currently offline. Turn on your availability to receive ride requests.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Rides */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                Available Rides
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isOnline ? 'New ride requests in your area' : 'Go online to see available rides'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isOnline ? (
                <div className="text-center py-8 text-slate-400">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Turn on your availability to see ride requests</p>
                </div>
              ) : availableRides.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rides available right now</p>
                  <p className="text-sm">New requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="bg-slate-900/50 border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getRideTypeIcon(ride.rideType)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {ride.rideType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-400">
                            ${ride.discountedFare || ride.fare}
                          </div>
                          {ride.discountedFare && (
                            <div className="text-sm text-slate-400 line-through">
                              ${ride.fare}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <MapPin className="h-4 w-4 text-green-400" />
                          <span>{ride.pickupLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <MapPin className="h-4 w-4 text-red-400" />
                          <span>{ride.dropLocation}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Navigation className="h-3 w-3" />
                            <span>{ride.distanceKm} km</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{ride.passenger.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRide(ride.id)}
                          disabled={processingRides.has(ride.id) || !!activeRide}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingRides.has(ride.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRide(ride.id)}
                          disabled={processingRides.has(ride.id)}
                          className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          {processingRides.has(ride.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Rides */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                My Rides
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your recent and active rides
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rides.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rides yet</p>
                  <p className="text-sm">Your rides will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rides.slice(0, 10).map((ride) => (
                    <div
                      key={ride.id}
                      className="bg-slate-900/50 border border-slate-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getRideTypeIcon(ride.rideType)}
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${getStatusColor(ride.status)}`}
                          >
                            {ride.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            ${ride.discountedFare || ride.fare}
                          </div>
                          {ride.rating && (
                            <div className="flex items-center space-x-1 text-sm text-yellow-400">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{ride.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <MapPin className="h-4 w-4 text-green-400" />
                          <span>{ride.pickupLocation}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-300">
                          <MapPin className="h-4 w-4 text-red-400" />
                          <span>{ride.dropLocation}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Navigation className="h-3 w-3" />
                            <span>{ride.distanceKm} km</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{ride.passenger.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{ride.passenger.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for active rides */}
                      {ride.status === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => updateRideStatus(ride.id, 'in_progress')}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Start Ride
                        </Button>
                      )}
                      
                      {ride.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateRideStatus(ride.id, 'completed')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete Ride
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}