import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeSession } from '@/lib/ai-service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = (await context.params).id;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId
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
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: meeting.id,
        groupId: meeting.groupId,
        date: meeting.date.toISOString(),
        status: meeting.status,
        transcript: meeting.transcript,
        fellow: meeting.fellow,
        analyses: meeting.analyses.map(analysis => ({
          id: analysis.id,
          summary: analysis.summary,
          contentCoverage: analysis.contentCoverage,
          facilitationQuality: analysis.facilitationQuality,
          protocolSafety: analysis.protocolSafety,
          riskDetection: analysis.riskDetection,
          supervisorStatus: analysis.supervisorStatus,
          supervisorNotes: analysis.supervisorNotes,
          createdAt: analysis.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = (await context.params).id;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const analysis = await analyzeSession(meeting.transcript);

    const savedAnalysis = await prisma.meetingAnalysis.create({
      data: {
        meetingId: meeting.id,
        summary: analysis.summary,
        contentCoverage: analysis.contentCoverage,
        facilitationQuality: analysis.facilitationQuality,
        protocolSafety: analysis.protocolSafety,
        riskDetection: analysis.riskDetection
      }
    });

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'PROCESSED' }
    });

    return NextResponse.json({
      analysis: {
        id: savedAnalysis.id,
        summary: savedAnalysis.summary,
        contentCoverage: savedAnalysis.contentCoverage,
        facilitationQuality: savedAnalysis.facilitationQuality,
        protocolSafety: savedAnalysis.protocolSafety,
        riskDetection: savedAnalysis.riskDetection,
        supervisorStatus: savedAnalysis.supervisorStatus,
        supervisorNotes: savedAnalysis.supervisorNotes,
        createdAt: savedAnalysis.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to analyze meeting:', error);
    return NextResponse.json(
      { error: 'Failed to analyze meeting' },
      { status: 500 }
    );
  }
}
