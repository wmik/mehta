import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = params.id

    // Get session with full details
    const sessionData = await prisma.session.findFirst({
      where: {
        id: sessionId,
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
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}