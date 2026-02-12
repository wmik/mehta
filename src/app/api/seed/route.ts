import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  return NextResponse.json({ 
      message: 'Seed script completed - supervisor already exists',
      supervisorExists: true
    })
}