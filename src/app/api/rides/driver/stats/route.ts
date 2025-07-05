// app/api/rides/driver/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@/src/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can view stats' }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get all completed rides for this driver
    const allRides = await prisma.ride.findMany({
      where: {
        driverId: session.user.id,
        status: 'completed'
      },
      select: {
        fare: true,
        discountedFare: true,
        rating: true,
        requestedAt: true
      }
    })

    // Get today's completed rides
    const todayRides = await prisma.ride.findMany({
      where: {
        driverId: session.user.id,
        status: 'completed',
        requestedAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      select: {
        fare: true,
        discountedFare: true
      }
    })

    // Calculate stats
    const totalRides = allRides.length
    const totalEarnings = allRides.reduce((sum, ride) => 
      sum + (ride.discountedFare || ride.fare), 0
    )
    
    const ridesWithRating = allRides.filter(ride => ride.rating !== null)
    const averageRating = ridesWithRating.length > 0 
      ? ridesWithRating.reduce((sum, ride) => sum + (ride.rating || 0), 0) / ridesWithRating.length
      : 0

    const todayRidesCount = todayRides.length
    const todayEarnings = todayRides.reduce((sum, ride) => 
      sum + (ride.discountedFare || ride.fare), 0
    )

    const stats = {
      totalRides,
      totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      averageRating: Math.round(averageRating * 10) / 10,   // Round to 1 decimal place
      todayRides: todayRidesCount,
      todayEarnings: Math.round(todayEarnings * 100) / 100
    }

    return NextResponse.json({ stats }, { status: 200 })

  } catch (error) {
    console.error('Error fetching driver stats:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}