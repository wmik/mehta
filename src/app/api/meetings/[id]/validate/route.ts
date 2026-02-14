import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Extract params to avoid unused variable warning
  try {
    const { analysisId, supervisorStatus, supervisorNotes } =
      await request.json();

    const exists = await prisma.meetingAnalysis.findFirst({
      where: {
        id: analysisId
      }
    });

    if (!exists) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const analysis = await prisma.meetingAnalysis.update({
      where: { id: analysisId },
      data: {
        supervisorStatus,
        supervisorNotes,
        reviewedAt: new Date()
      }
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
