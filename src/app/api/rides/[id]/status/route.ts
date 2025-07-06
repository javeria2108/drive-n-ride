
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
/**
 * @swagger
 * api/rides/{id}/status:
 *   post:
 *     summary: Update the status of a ride (driver-only)
 *     tags:
 *       - Rides
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the ride
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Ride status updated successfully
 *       400:
 *         description: Invalid input or invalid status transition
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not the ride owner or wrong role)
 *       404:
 *         description: Ride not found
 */

export async function POST(request: NextRequest) {
  try {
    
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const rideId = segments[segments.indexOf('rides') + 1]

    if (!rideId) {
      return NextResponse.json({ message: 'Ride ID missing in URL' }, { status: 400 })
    }

    // ✅ Get session from request context
    const session = await getServerSession({ req: request, ...authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can update ride status' }, { status: 403 })
    }

    const { status } = await request.json()

    // ✅ Validate status
    const validStatuses = ['accepted', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        message: 'Invalid status provided'
      }, { status: 400 })
    }

    // ✅ Check if the ride exists and belongs to the driver
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

    // ✅ Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    }

    const currentStatus = ride.status
    const allowedTransitions = validTransitions[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json({
        message: `Cannot transition from ${currentStatus} to ${status}`
      }, { status: 400 })
    }

    // ✅ Update ride status
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
