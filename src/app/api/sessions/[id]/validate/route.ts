import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { analysisId, supervisorStatus, supervisorNotes } = await request.json()

    // For MVP, get first supervisor
    const supervisor = await prisma.supervisor.findFirst({
      where: {
        not: {}
      }
    })

    const analysis = await prisma.sessionAnalysis.findFirst({
      where: {
        id: analysisId
      }
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const updatedAnalysis = await prisma.sessionAnalysis.update({
      where: { id: analysisId },
      data: {
        supervisorStatus,
        supervisorNotes,
        reviewedAt: new Date()
      }
    })

    // Update session status based on validation result
    await prisma.session.update({
      where: { id: analysis.sessionId },
      data: {
        status: supervisorStatus === 'VALIDATED' ? 'SAFE' : 
                supervisorStatus === 'REJECTED' ? 'FLAGGED_FOR_REVIEW' : 'PROCESSED'
      }
    })

    return NextResponse.json({ 
      message: 'Analysis validated successfully',
      analysis: updatedAnalysis
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate analysis' },
      { status: 500 }
    )
  }
}