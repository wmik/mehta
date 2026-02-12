import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // For MVP, get first supervisor
    const supervisor = await prisma.supervisor.findFirst({
      where: { not: {} }
    })

    if (!supervisor) {
      return NextResponse.json({ error: 'No supervisor found' }, { status: 404 })
    }

    const sessionCount = await prisma.session.count({
      where: { supervisorId: supervisor?.id }
    })

    return NextResponse.json({ 
      message: 'API working',
      supervisorFound: !!supervisor,
      sessionCount: sessionCount
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // For MVP, get first supervisor
    const supervisor = await prisma.supervisor.findFirst({
      where: { not: {} }
    })

    if (!supervisor) {
      return NextResponse.json({ error: 'No supervisor found' }, { status: 404 })
    }

    // Create one simple test session
    const fellow = await prisma.fellow.findFirst({
      where: { supervisorId: supervisor?.id }
    })

    if (!fellow) {
      return NextResponse.json({ error: 'No fellow found' }, { status: 404 })
    }

    const session = await prisma.session.create({
      data: {
        groupId: 'TEST-001',
        date: new Date(),
        transcript: 'Test session transcript',
        status: 'PENDING',
        fellowId: fellow.id,
        supervisorId: supervisor.id,
      }
    })

    return NextResponse.json({ 
      message: 'Test session created',
      session: {
        id: session.id,
        groupId: session.groupId,
        status: session.status
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}