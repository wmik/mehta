import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeSession } from '@/lib/ai-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
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

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id
    
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
      },
      include: {
        fellow: true
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if AI provider is available
    const { getAvailableProviders } = await import('@/lib/ai-service')
    const availableProviders = getAvailableProviders()
    
    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers available. Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY' },
        { status: 400 }
      )
    }

    // Run AI analysis
    const analysis = await analyzeSession(session.transcript)
    
    // Save analysis to database
    const sessionAnalysis = await prisma.sessionAnalysis.create({
      data: {
        sessionId: session.id,
        summary: analysis.summary,
        contentCoverage: analysis.contentCoverage,
        facilitationQuality: analysis.facilitationQuality,
        protocolSafety: analysis.protocolSafety,
        riskDetection: analysis.riskDetection,
        supervisorStatus: null, // Will be set by human reviewer
        supervisorNotes: null,
      }
    })

    // Update session status
    await prisma.session.update({
      where: { id: session.id },
      data: {
        status: analysis.riskDetection.status === 'RISK' ? 'FLAGGED_FOR_REVIEW' : 'PROCESSED'
      }
    })

    return NextResponse.json({ 
      message: 'Session analysis completed',
      analysis: sessionAnalysis,
      sessionStatus: analysis.riskDetection.status === 'RISK' ? 'FLAGGED_FOR_REVIEW' : 'PROCESSED'
    })
  } catch (error) {
    console.error('Session analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze session' },
      { status: 500 }
    )
  }
}