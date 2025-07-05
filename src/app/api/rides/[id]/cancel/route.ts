// app/api/rides/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma' 
import { Role } from '@/src/generated/prisma'
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const rideId = params.id

    // Check if the ride exists
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride) {
      return NextResponse.json({ message: 'Ride not found' }, { status: 404 })
    }

    // Check if the user has permission to cancel this ride
    const canCancel = 
      (session.user.role === 'passenger' && ride.passengerId === session.user.id) ||
      (session.user.role === 'driver' && ride.driverId === session.user.id)

    if (!canCancel) {
      return NextResponse.json({ 
        message: 'You do not have permission to cancel this ride' 
      }, { status: 403 })
    }

    // Check if the ride can be cancelled
    if (ride.status === 'completed') {
      return NextResponse.json({ 
        message: 'Cannot cancel a completed ride' 
      }, { status: 400 })
    }

    if (ride.status === 'cancelled') {
      return NextResponse.json({ 
        message: 'Ride is already cancelled' 
      }, { status: 400 })
    }

    // Cancel the ride
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'cancelled',
        cancelledBy: session.user.role as Role
      }
    })

    return NextResponse.json({ 
      message: 'Ride cancelled successfully', 
      ride: updatedRide 
    }, { status: 200 })

  } catch (error) {
    console.error('Error cancelling ride:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}