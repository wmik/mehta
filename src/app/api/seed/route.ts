import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Create demo supervisor
    const hashedPassword = await bcrypt.hash('password', 12)
    
    const supervisor = await prisma.supervisor.upsert({
      where: { email: 'supervisor@shamiri.org' },
      update: {},
      create: {
        email: 'supervisor@shamiri.org',
        name: 'Dr. Sarah Johnson',
        password: hashedPassword,
      },
    })

    // Create demo fellows
    const fellows = [
      {
        name: 'Michael Kimani',
        email: 'michael.k@shamiri.org',
        supervisorId: supervisor.id,
      },
      {
        name: 'Grace Wanjiru',
        email: 'grace.w@shamiri.org',
        supervisorId: supervisor.id,
      },
      {
        name: 'David Otieno',
        email: 'david.o@shamiri.org',
        supervisorId: supervisor.id,
      },
    ]

    for (const fellowData of fellows) {
      await prisma.fellow.upsert({
        where: { email: fellowData.email },
        update: {},
        create: fellowData,
      })
    }

    return NextResponse.json({ 
      message: 'Test data created successfully',
      supervisor: { id: supervisor.id, email: supervisor.email, name: supervisor.name }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create test data' },
      { status: 500 }
    )
  }
}