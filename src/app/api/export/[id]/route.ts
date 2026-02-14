import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const meetingId = (await context.params).id;

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        fellow: true,
        analyses: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const analysis = meeting.analyses[0];

    // Build CSV content
    const headers = ['Field', 'Value'];

    const rows = [
      ['Session ID', meeting.id],
      ['Group ID', meeting.groupId],
      ['Date', meeting.date.toISOString()],
      ['Status', meeting.status],
      ['Fellow Name', meeting.fellow.name],
      ['Fellow Email', meeting.fellow.email],
      [''],
      ['--- Analysis ---', ''],
      ['Summary', analysis?.summary || 'N/A'],
      [''],
      ['--- Content Coverage ---', ''],
      [
        'Score',
        analysis?.contentCoverage
          ? String((analysis.contentCoverage as any).score)
          : 'N/A'
      ],
      [
        'Rating',
        analysis?.contentCoverage
          ? String((analysis.contentCoverage as any).rating)
          : 'N/A'
      ],
      [
        'Justification',
        analysis?.contentCoverage
          ? String((analysis.contentCoverage as any).justification)
          : 'N/A'
      ],
      [''],
      ['--- Facilitation Quality ---', ''],
      [
        'Score',
        analysis?.facilitationQuality
          ? String((analysis.facilitationQuality as any).score)
          : 'N/A'
      ],
      [
        'Rating',
        analysis?.facilitationQuality
          ? String((analysis.facilitationQuality as any).rating)
          : 'N/A'
      ],
      [
        'Justification',
        analysis?.facilitationQuality
          ? String((analysis.facilitationQuality as any).justification)
          : 'N/A'
      ],
      [''],
      ['--- Protocol Safety ---', ''],
      [
        'Score',
        analysis?.protocolSafety
          ? String((analysis.protocolSafety as any).score)
          : 'N/A'
      ],
      [
        'Rating',
        analysis?.protocolSafety
          ? String((analysis.protocolSafety as any).rating)
          : 'N/A'
      ],
      [
        'Justification',
        analysis?.protocolSafety
          ? String((analysis.protocolSafety as any).justification)
          : 'N/A'
      ],
      [''],
      ['--- Risk Detection ---', ''],
      [
        'Status',
        analysis?.riskDetection
          ? String((analysis.riskDetection as any).status)
          : 'N/A'
      ],
      [
        'Quote',
        analysis?.riskDetection
          ? String((analysis.riskDetection as any).quote || 'N/A')
          : 'N/A'
      ],
      [
        'Explanation',
        analysis?.riskDetection
          ? String((analysis.riskDetection as any).explanation || 'N/A')
          : 'N/A'
      ],
      [''],
      ['--- Supervisor Review ---', ''],
      ['Status', analysis?.supervisorStatus || 'Pending'],
      ['Notes', analysis?.supervisorNotes || 'N/A'],
      [
        'Reviewed At',
        analysis?.reviewedAt ? analysis.reviewedAt.toISOString() : 'N/A'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="session-${meeting.groupId}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export session' },
      { status: 500 }
    );
  }
}
