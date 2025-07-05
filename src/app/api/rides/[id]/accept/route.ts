import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { NextApiRequest } from 'next'
import type { NextPageContext } from 'next'
import type { NextRequest as AppRequest } from 'next/server'

// ✅ This type is required for dynamic routes in App Router
type Context = {
  params: { id: string }
}

export async function POST(request: NextRequest, context: Context) {
  const { id: rideId } = context.params

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can accept rides' }, { status: 403 })
    }

    const existingRide = await prisma.ride.findFirst({
      where: {
        driverId: session.user.id,
        status: {
          in: ['accepted', 'in_progress']
        }
      }
    })

    if (existingRide) {
      return NextResponse.json({ 
        message: 'You already have an active ride. Please complete it first.' 
      }, { status: 400 })
    }

    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
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

    if (!ride) {
      return NextResponse.json({ message: 'Ride not found' }, { status: 404 })
    }

    if (ride.status !== 'requested') {
      return NextResponse.json({ 
        message: 'This ride is no longer available' 
      }, { status: 400 })
    }

    if (ride.driverId) {
      return NextResponse.json({ 
        message: 'This ride has already been accepted by another driver' 
      }, { status: 400 })
    }

    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: session.user.id,
        status: 'accepted'
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
      message: 'Ride accepted successfully', 
      ride: updatedRide 
    }, { status: 200 })

  } catch (error) {
    console.error('Error accepting ride:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
