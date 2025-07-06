
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * api/rides/available:
 *   get:
 *     summary: Get available ride requests for drivers
 *     tags:
 *       - Rides
 *     description: |
 *       Allows authenticated drivers to fetch the latest ride requests that haven't been accepted by any driver yet.
 *       Only returns rides where the status is "requested" and `driverId` is null.
 *     responses:
 *       200:
 *         description: A list of available ride requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: requested
 *                       pickupLocation:
 *                         type: string
 *                       dropoffLocation:
 *                         type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       passenger:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *       401:
 *         description: Unauthorized - user not logged in
 *       403:
 *         description: Only drivers can view available rides
 *       500:
 *         description: Internal server error
 */


export async function GET(request: NextRequest) {
  try {
    // ✅ Pass request explicitly to getServerSession in App Router
    const session = await getServerSession({ req: request, ...authOptions })

    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can view available rides' }, { status: 403 })
    }

    // ✅ Get all rides that are requested and not assigned to any driver
    const rides = await prisma.ride.findMany({
      where: {
        status: 'requested',
        driverId: null
      },
      include: {
        passenger: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      },
      take: 10 // limit results
    })

    return NextResponse.json({ rides }, { status: 200 })

  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json({
      message: 'Internal server error'
    }, { status: 500 })
  }
}
