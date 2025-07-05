// app/api/rides/available/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@/src/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'driver') {
      return NextResponse.json({ message: 'Only drivers can view available rides' }, { status: 403 })
    }

    // Get rides that are requested (not yet accepted by any driver)
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
      take: 10 // Limit to 10 most recent rides
    })

    return NextResponse.json({ rides }, { status: 200 })

  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}