import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get supervisor's sessions with fellow information
    const sessions = await prisma.session.findMany({
      where: {
        supervisorId: session.user.id
      },
      include: {
        fellow: {
          select: {
            name: true,
            email: true
          }
        },
        analyses: {
          select: {
            id: true,
            riskDetection: true,
            supervisorStatus: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}