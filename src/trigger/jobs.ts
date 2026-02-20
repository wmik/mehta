import { logger, task, queue, metadata } from '@trigger.dev/sdk';
import { analyzeSession } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

const analysisQueue = queue({
  name: 'session-analysis',
  concurrencyLimit: 2
});

export const analyzeSessionJob = task({
  id: 'analyze-session',
  maxDuration: 600,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    randomize: true
  },
  queue: analysisQueue,
  run: async (payload: { meetingId: string }, { ctx }) => {
    logger.info('Starting session analysis', {
      meetingId: payload.meetingId,
      attempt: ctx.attempt
    });

    metadata.set('status', 'starting');
    metadata.set('progressMessage', 'Loading session transcript...');
    metadata.set('meetingId', payload.meetingId);

    try {
      const meeting = await prisma.meeting.findUnique({
        where: { id: payload.meetingId }
      });

      if (!meeting) {
        throw new Error(`Meeting not found: ${payload.meetingId}`);
      }

      if (!meeting.transcript) {
        throw new Error(`Meeting has no transcript: ${payload.meetingId}`);
      }

      metadata.set('status', 'analyzing');
      metadata.set('progressMessage', 'Evaluating content coverage...');

      const analysis = await analyzeSession(meeting.transcript);

      metadata.set('progressMessage', 'Assessing facilitation quality...');
      metadata.set('progressMessage', 'Checking protocol safety...');
      metadata.set('progressMessage', 'Detecting risk indicators...');
      metadata.set('progressMessage', 'Finalizing analysis...');

      metadata.set('status', 'saving');

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

      const riskStatus = (analysis.riskDetection as { status?: string })
        ?.status;
      const finalStatus =
        riskStatus === 'RISK' ? 'FLAGGED_FOR_REVIEW' : 'PROCESSED';

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: finalStatus,
          runId: null,
          publicAccessToken: null
        }
      });

      logger.info('Session analysis completed', {
        meetingId: payload.meetingId,
        analysisId: savedAnalysis.id,
        riskStatus
      });

      metadata.set('status', 'completed');

      const notificationType = riskStatus === 'RISK' ? 'warning' : 'info';
      const notificationTitle =
        riskStatus === 'RISK' ? 'Risk Detected' : 'Session Analyzed';
      const notificationDescription =
        riskStatus === 'RISK'
          ? `${meeting.groupId} analysis complete - Risk detected, requires review`
          : `${meeting.groupId} analysis ready for review`;

      await prisma.notification.create({
        data: {
          userId: meeting.supervisorId,
          title: notificationTitle,
          description: notificationDescription,
          custom: { type: notificationType }
        }
      });

      return {
        analysisId: savedAnalysis.id,
        riskStatus,
        meetingId: meeting.id
      };
    } catch (error) {
      logger.error('Session analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        meetingId: payload.meetingId,
        attempt: ctx.attempt
      });

      await prisma.meeting
        .update({
          where: { id: payload.meetingId },
          data: {
            status: 'PENDING',
            runId: null,
            publicAccessToken: null
          }
        })
        .catch(() => {});

      throw error;
    }
  }
});
