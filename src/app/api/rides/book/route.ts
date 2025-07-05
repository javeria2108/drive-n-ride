// app/api/rides/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@/src/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'passenger') {
      return NextResponse.json({ message: 'Only passengers can book rides' }, { status: 403 })
    }

    const { pickupLocation, dropLocation, rideType, distanceKm, fare } = await request.json()

    // Validate required fields
    if (!pickupLocation || !dropLocation || !rideType || !distanceKm || !fare) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Check if passenger already has an active ride
    const existingRide = await prisma.ride.findFirst({
      where: {
        passengerId: session.user.id,
        status: {
          in: ['requested', 'accepted', 'in_progress']
        }
      }
    })

    if (existingRide) {
      return NextResponse.json({ 
        message: 'You already have an active ride. Please complete or cancel it first.' 
      }, { status: 400 })
    }

    // Create the ride
    const ride = await prisma.ride.create({
      data: {
        passengerId: session.user.id,
        pickupLocation,
        dropLocation,
        distanceKm: parseFloat(distanceKm),
        rideType,
        fare: parseFloat(fare),
        status: 'requested'
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Ride booked successfully', 
      ride 
    }, { status: 201 })

  } catch (error) {
    console.error('Error booking ride:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}