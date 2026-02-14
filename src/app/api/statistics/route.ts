import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.meeting.findMany({
      where: {
        supervisorId: session.user.id
      },
      include: {
        analyses: {
          select: {
            contentCoverage: true,
            facilitationQuality: true,
            protocolSafety: true,
            riskDetection: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    const fellowCount = await prisma.fellow.count({
      where: {
        supervisorId: session.user.id
      }
    });

    const totalSessions = sessions.length;
    const analyzedSessions = sessions.filter(s => s.analyses.length > 0).length;
    const riskCount = sessions.filter(s => {
      const analysis = s.analyses[0];
      return (
        analysis?.riskDetection &&
        typeof analysis.riskDetection === 'object' &&
        'status' in analysis.riskDetection &&
        analysis.riskDetection.status === 'RISK'
      );
    }).length;

    let totalCC = 0,
      totalFQ = 0,
      totalPS = 0;
    let ccCount = 0,
      fqCount = 0,
      psCount = 0;
    let ccLow = 0,
      ccMedium = 0,
      ccHigh = 0;
    let fqLow = 0,
      fqMedium = 0,
      fqHigh = 0;
    let psLow = 0,
      psMedium = 0,
      psHigh = 0;

    const riskCategories: Record<string, number> = {};

    sessions.forEach(s => {
      const analysis = s.analyses[0];
      if (!analysis) return;

      const cc = analysis.contentCoverage as Record<string, unknown> | null;
      const fq = analysis.facilitationQuality as Record<string, unknown> | null;
      const ps = analysis.protocolSafety as Record<string, unknown> | null;
      const rd = analysis.riskDetection as Record<string, unknown> | null;

      if (cc?.score) {
        totalCC += cc.score as number;
        ccCount++;
        const score = cc.score as number;
        if (score <= 1) ccLow++;
        else if (score <= 2) ccMedium++;
        else ccHigh++;
      }

      if (fq?.score) {
        totalFQ += fq.score as number;
        fqCount++;
        const score = fq.score as number;
        if (score <= 1) fqLow++;
        else if (score <= 2) fqMedium++;
        else fqHigh++;
      }

      if (ps?.score) {
        totalPS += ps.score as number;
        psCount++;
        const score = ps.score as number;
        if (score <= 1) psLow++;
        else if (score <= 2) psMedium++;
        else psHigh++;
      }

      if (rd?.status === 'RISK' && rd.category) {
        const category = rd.category as string;
        riskCategories[category] = (riskCategories[category] || 0) + 1;
      }
    });

    const riskBreakdown = Object.entries(riskCategories)
      .map(([category, count]) => ({
        category,
        count
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      summary: {
        totalSessions,
        analyzedSessions,
        fellowCount,
        riskCount
      },
      teamAverages: {
        contentCoverage: ccCount > 0 ? totalCC / ccCount : 0,
        facilitationQuality: fqCount > 0 ? totalFQ / fqCount : 0,
        protocolSafety: psCount > 0 ? totalPS / psCount : 0
      },
      scoreDistribution: {
        contentCoverage: { low: ccLow, medium: ccMedium, high: ccHigh },
        facilitationQuality: { low: fqLow, medium: fqMedium, high: fqHigh },
        protocolSafety: { low: psLow, medium: psMedium, high: psHigh }
      },
      riskBreakdown
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
