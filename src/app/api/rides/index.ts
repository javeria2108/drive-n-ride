// pages/api/rides/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const rides = await prisma.ride.findMany({
        where: {
          OR: [
            { passengerId: session.user.id },
            { driverId: session.user.id },
          ],
        },
        include: {
          passenger: {
            select: { name: true, phoneNumber: true },
          },
          driver: {
            select: { name: true, phoneNumber: true },
          },
        },
        orderBy: { requestedAt: 'desc' },
      })

      res.status(200).json(rides)
    } catch (error) {
      console.error('Error fetching rides:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { pickupLocation, dropLocation, distanceKm, rideType } = req.body

      if (!pickupLocation || !dropLocation || !distanceKm || !rideType) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Calculate fare based on ride type and distance
      const baseFares = { bike: 15, rickshaw: 20, car: 30 }
      const fare = baseFares[rideType as keyof typeof baseFares] * distanceKm

      // Check for discount eligibility
      const completedRides = await prisma.ride.count({
        where: {
          passengerId: session.user.id,
          status: 'completed',
        },
      })

      const discountedFare = completedRides > 0 && completedRides % 5 === 0
        ? fare * 0.7
        : null

      const ride = await prisma.ride.create({
        data: {
          passengerId: session.user.id,
          pickupLocation,
          dropLocation,
          distanceKm,
          rideType,
          fare,
          discountedFare,
          status: 'requested',
        },
      })

      res.status(201).json(ride)
    } catch (error) {
      console.error('Error creating ride:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}