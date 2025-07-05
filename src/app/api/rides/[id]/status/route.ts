// app/api/rides/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma' 

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can update ride status' }, { status: 403 })
    }

    const rideId = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['accepted', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        message: 'Invalid status provided' 
      }, { status: 400 })
    }

    // Check if the ride exists and belongs to this driver
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride) {
      return NextResponse.json({ message: 'Ride not found' }, { status: 404 })
    }

    if (ride.driverId !== session.user.id) {
      return NextResponse.json({ 
        message: 'You can only update your own rides' 
      }, { status: 403 })
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // No transitions from completed
      'cancelled': []  // No transitions from cancelled
    }

    const currentStatus = ride.status
    const allowedTransitions = validTransitions[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json({ 
        message: `Cannot transition from ${currentStatus} to ${status}` 
      }, { status: 400 })
    }

    // Update the ride status
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { status },
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
      message: 'Ride status updated successfully', 
      ride: updatedRide 
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating ride status:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}