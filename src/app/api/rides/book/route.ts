
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/rides/book:
 *   post:
 *     summary: Book a ride (passengers only)
 *     tags:
 *       - Rides
 *     description: |
 *       Allows an authenticated passenger to book a ride. Prevents duplicate active rides.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupLocation
 *               - dropLocation
 *               - rideType
 *               - distanceKm
 *               - fare
 *             properties:
 *               pickupLocation:
 *                 type: string
 *                 example: "123 Main Street"
 *               dropLocation:
 *                 type: string
 *                 example: "456 Market Avenue"
 *               rideType:
 *                 type: string
 *                 example: "standard"
 *               distanceKm:
 *                 type: number
 *                 example: 12.5
 *               fare:
 *                 type: number
 *                 example: 850.0
 *     responses:
 *       201:
 *         description: Ride booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ride booked successfully
 *                 ride:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     pickupLocation:
 *                       type: string
 *                     dropLocation:
 *                       type: string
 *                     rideType:
 *                       type: string
 *                     distanceKm:
 *                       type: number
 *                     fare:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: requested
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
 *         description: |
 *           - Missing required fields  
 *           - Already has an active ride
 *       401:
 *         description: Unauthorized - user not logged in
 *       403:
 *         description: Only passengers can book rides
 *       500:
 *         description: Internal server error
 */


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession({ req: request, ...authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'passenger') {
      return NextResponse.json({ message: 'Only passengers can book rides' }, { status: 403 })
    }

    const { pickupLocation, dropLocation, rideType, distanceKm, fare } = await request.json()

    // ✅ Validate required fields
    if (!pickupLocation || !dropLocation || !rideType || !distanceKm || !fare) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // ✅ Check if passenger already has an active ride
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

    // ✅ Create the ride
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
