import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { analysisId, supervisorStatus, supervisorNotes, overrideRisk } =
      await request.json();

    const existingAnalysis = await prisma.meetingAnalysis.findFirst({
      where: {
        id: analysisId
      }
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      supervisorStatus,
      supervisorNotes,
      reviewedAt: new Date()
    };

    if (overrideRisk && supervisorStatus === 'VALIDATED') {
      updateData.riskDetection = {
        status: 'SAFE',
        quote: null,
        explanation: 'Supervisor override: Risk assessment manually cleared'
      };
    }

    const analysis = await prisma.meetingAnalysis.update({
      where: { id: analysisId },
      data: updateData
    });

    // Update meeting status based on validation result
    await prisma.meeting.update({
      where: { id: analysis.meetingId },
      data: {
        status:
          supervisorStatus === 'VALIDATED'
            ? 'SAFE'
            : supervisorStatus === 'REJECTED'
              ? 'FLAGGED_FOR_REVIEW'
              : 'PROCESSED'
      }
    });

    // Fetch the updated meeting with relations
    const meeting = await prisma.meeting.findUnique({
      where: { id: analysis.meetingId },
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

    return NextResponse.json({
      message: 'Analysis validated successfully',
      analysis,
      session: meeting
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate analysis' },
      { status: 500 }
    );
  }
}
