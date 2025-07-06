
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


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
