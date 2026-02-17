import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const jobId = body.job?.id;
    const status = body.job?.status;
    const meetingId = body.job?.payload?.meetingId;

    console.log('Trigger webhook received:', { jobId, status, meetingId });

    if (status === 'COMPLETED') {
      // Analysis already saved in job - meeting status updated to PROCESSED
      return NextResponse.json({ received: true, status: 'completed' });
    }

    if (status === 'FAILED') {
      // Update meeting status to indicate failure
      if (meetingId) {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'PENDING' }
        });
      }
      return NextResponse.json({ received: true, status: 'failed' });
    }

    if (status === 'RUNNING') {
      return NextResponse.json({ received: true, status: 'running' });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
