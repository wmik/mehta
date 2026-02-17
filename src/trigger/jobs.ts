import { triggerClient } from '@/lib/trigger';
import { analyzeSession } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

export const analyzeSessionJob = triggerClient.defineJob({
  id: 'analyze-session',
  name: 'Analyze Session',
  version: '1.0.0',
  run: async (payload: { meetingId: string }, ctx) => {
    ctx.logger.info('Starting session analysis', {
      meetingId: payload.meetingId
    });

    const meeting = await prisma.meeting.findUnique({
      where: { id: payload.meetingId }
    });

    if (!meeting) {
      throw new Error(`Meeting not found: ${payload.meetingId}`);
    }

    // Update status to processing
    await prisma.meeting.update({
      where: { id: payload.meetingId },
      data: { status: 'PROCESSING' }
    });

    // Run AI analysis
    if (!meeting.transcript) {
      throw new Error(`Meeting has no transcript: ${payload.meetingId}`);
    }
    const analysis = await analyzeSession(meeting.transcript);

    // Save analysis to database
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

    // Update meeting status to processed
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: 'PROCESSED' }
    });

    ctx.logger.info('Session analysis completed', {
      meetingId: payload.meetingId,
      analysisId: savedAnalysis.id
    });

    return { analysisId: savedAnalysis.id };
  }
});
