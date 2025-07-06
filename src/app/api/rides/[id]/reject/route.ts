

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
/**
 * @swagger
 * api/rides/{id}/reject:
 *   post:
 *     summary: Reject a ride (for drivers only)
 *     tags:
 *       - Rides
 *     description: |
 *       Allows a driver to reject a requested ride. This does not change the database, just acknowledges the rejection.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the ride to reject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ride rejected successfully
 *       400:
 *         description: |
 *           - Ride ID missing in URL  
 *           - Ride is not in 'requested' state
 *       401:
 *         description: Unauthorized - user not authenticated
 *       403:
 *         description: Only drivers can reject rides
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Extract rideId from the URL
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const rideId = segments[segments.indexOf('rides') + 1]

    if (!rideId) {
      return NextResponse.json({ message: 'Ride ID missing in URL' }, { status: 400 })
    }

    // Get session with request context
    const session = await getServerSession({ req: request, ...authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can reject rides' }, { status: 403 })
    }

    // Check if the ride exists
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    })

    if (!ride) {
      return NextResponse.json({ message: 'Ride not found' }, { status: 404 })
    }

    if (ride.status !== 'requested') {
      return NextResponse.json({
        message: 'This ride is no longer available'
      }, { status: 400 })
    }

    // No DB change — just respond with success
    return NextResponse.json({
      message: 'Ride rejected successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Error rejecting ride:', error)
    return NextResponse.json({
      message: 'Internal server error'
    }, { status: 500 })
  }
}
