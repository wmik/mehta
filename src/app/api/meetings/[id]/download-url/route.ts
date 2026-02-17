import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getObjectUrl, isS3Url, extractKeyFromUrl } from '@/lib/s3';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = (await context.params).id;
    const { searchParams } = new URL(request.url);
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10);

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { transcript: true }
    });

    if (!meeting?.transcript) {
      return NextResponse.json(
        { error: 'No transcript found' },
        { status: 404 }
      );
    }

    if (!isS3Url(meeting.transcript)) {
      return NextResponse.json(
        { error: 'Transcript is not stored in S3' },
        { status: 400 }
      );
    }

    const key = extractKeyFromUrl(meeting.transcript);
    if (!key) {
      return NextResponse.json(
        { error: 'Invalid transcript URL' },
        { status: 400 }
      );
    }

    const maxExpiresIn = 3600;
    const actualExpiresIn = Math.min(expiresIn, maxExpiresIn);
    const presignedUrl = await getObjectUrl(key, actualExpiresIn);

    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error('Failed to generate download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
