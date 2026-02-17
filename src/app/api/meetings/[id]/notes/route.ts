import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { notes } = await request.json();

    const existingAnalysis = await prisma.meetingAnalysis.findFirst({
      where: {
        meetingId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found for this meeting' },
        { status: 404 }
      );
    }

    const analysis = await prisma.meetingAnalysis.update({
      where: { id: existingAnalysis.id },
      data: {
        supervisorNotes: notes
      }
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Save notes error:', error);
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    );
  }
}
