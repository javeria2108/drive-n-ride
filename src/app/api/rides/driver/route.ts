import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma' 

/**
 * @swagger
 * /rides/driver:
 *   get:
 *     summary: Get all rides assigned to the logged-in driver
 *     description: Retrieves a list of rides where the logged-in user is the assigned driver. Only accessible by drivers.
 *     tags:
 *       - Rides (Driver)
 *     responses:
 *       200:
 *         description: List of driver's rides
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
 *                       pickupLocation:
 *                         type: string
 *                       dropLocation:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [requested, accepted, in_progress, completed, cancelled]
 *                       fare:
 *                         type: number
 *                       discountedFare:
 *                         type: number
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
 *         description: Unauthorized
 *       403:
 *         description: Only drivers can access this route
 *       500:
 *         description: Internal server error
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can view their rides' }, { status: 403 })
    }

    const rides = await prisma.ride.findMany({
      where: {
        driverId: session.user.id
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
      }
    })

    return NextResponse.json({ rides }, { status: 200 })

  } catch (error) {
    console.error('Error fetching driver rides:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}