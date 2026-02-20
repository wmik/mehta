import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  uploadToS3,
  getObjectContent,
  isS3Url,
  deleteFromS3,
  extractKeyFromUrl
} from '@/lib/s3';
import { tasks } from '@trigger.dev/sdk';
import { analyzeSessionJob } from '@/trigger/jobs';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/lib/transcript';

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
            id: true,
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

    let transcriptContent = meeting.transcript || '';

    if (meeting.transcript && isS3Url(meeting.transcript)) {
      try {
        transcriptContent = await getObjectContent(
          extractKeyFromUrl(meeting.transcript) || ''
        );
      } catch (error) {
        console.error('Failed to fetch transcript from S3:', error);
      }
    }

    return NextResponse.json({
      session: {
        id: meeting.id,
        groupId: meeting.groupId,
        date: meeting.date.toISOString(),
        status: meeting.status,
        transcript: transcriptContent,
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

    const handle = await tasks.trigger<typeof analyzeSessionJob>(
      'analyze-session',
      {
        meetingId: meeting.id
      }
    );

    // Update meeting status to indicate analysis is processing
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        status: 'PROCESSING',
        runId: handle.id,
        publicAccessToken: handle.publicAccessToken
      }
    });

    return NextResponse.json({
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
      status: 'queued'
    });
  } catch (error) {
    console.error('Failed to start analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = (await context.params).id;
    const contentType = request.headers.get('content-type') || '';

    let transcriptUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            },
            { status: 400 }
          );
        }

        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(extension)) {
          return NextResponse.json(
            {
              error: `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`
            },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `transcripts/${meetingId}/${file.name}`;

        const result = await uploadToS3(buffer, key, file.type);
        transcriptUrl = result.url;
      }
    } else {
      return NextResponse.json(
        { error: 'File upload required. Please upload a transcript file.' },
        { status: 400 }
      );
    }

    if (!transcriptUrl) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (meeting.transcript && isS3Url(meeting.transcript)) {
      const oldKey = extractKeyFromUrl(meeting.transcript);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
        } catch (error) {
          console.error('Failed to delete old transcript from S3:', error);
        }
      }
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { transcript: transcriptUrl, status: 'PENDING' }
    });

    return NextResponse.json({
      session: {
        id: updatedMeeting.id,
        groupId: updatedMeeting.groupId,
        date: updatedMeeting.date.toISOString(),
        status: updatedMeeting.status,
        transcript: updatedMeeting.transcript
      }
    });
  } catch (error) {
    console.error('Failed to update transcript:', error);
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    );
  }
}
