// app/api/rides/driver/route.ts
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