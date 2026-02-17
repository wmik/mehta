import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getObjectUrl,
  isS3Url,
  extractKeyFromUrl,
  objectExists
} from '@/lib/s3';

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

    // If transcript is an S3 URL, verify the object exists
    if (isS3Url(meeting.transcript)) {
      const key = extractKeyFromUrl(meeting.transcript);

      if (key) {
        let exists = false;
        try {
          exists = await objectExists(key);
        } catch (err: unknown) {
          console.error(err);
        }

        if (!exists) {
          // Clear invalid URL from database
          await prisma.meeting.update({
            where: { id: meetingId },
            data: { transcript: null }
          });

          return NextResponse.json(
            {
              error: 'Transcript file not found in storage. Please re-upload.'
            },
            { status: 410 }
          );
        }

        const maxExpiresIn = 3600;
        const actualExpiresIn = Math.min(expiresIn, maxExpiresIn);
        const presignedUrl = await getObjectUrl(key, actualExpiresIn);

        return NextResponse.json({ url: presignedUrl });
      }
    }

    // If not S3 URL, return plain text transcript
    if (meeting.transcript) {
      return new NextResponse(meeting.transcript, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="transcript-${meetingId}.txt"`
        }
      });
    }

    return NextResponse.json({ error: 'No transcript found' }, { status: 404 });
  } catch (error) {
    console.error('Failed to generate download URL:', error);
    return NextResponse.json(
      { error: 'Failed to download transcript. Please try again.' },
      { status: 500 }
    );
  }
}
