
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@/src/generated/prisma'

/**
 * @swagger
 * api/rides/{id}/accept:
 *   post:
 *     summary: Accept a ride request (drivers only)
 *     tags:
 *       - Rides
 *     description: |
 *       Allows a driver to accept a ride request. Only available to authenticated users with the "driver" role.
 *       A driver cannot accept a ride if they already have an active ride (status: accepted or in_progress).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the ride to accept
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ride accepted successfully
 *                 ride:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: accepted
 *                     driverId:
 *                       type: string
 *                     passenger:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *       400:
 *         description: Bad request - Missing ride ID, ride already accepted, or driver has active ride
 *       401:
 *         description: Unauthorized - No session or user
 *       403:
 *         description: Forbidden - Only drivers can accept rides
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */


const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Extract ride ID from the URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const rideId = pathSegments[pathSegments.indexOf('rides') + 1]

    if (!rideId) {
      return NextResponse.json({ message: 'Ride ID missing in URL' }, { status: 400 })
    }

    // Get session using request
    const session = await getServerSession({ req: request, ...authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can accept rides' }, { status: 403 })
    }

    // Check if driver already has an active ride
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

    // Check if the ride exists and is available
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

    // Accept the ride
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
    return NextResponse.json({
      message: 'Internal server error'
    }, { status: 500 })
  }
}
