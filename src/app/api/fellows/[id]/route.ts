import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const fellow = await prisma.fellow.findFirst({
      where: {
        id,
        supervisorId: session.user.id,
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            meetings: true
          }
        },
        meetings: {
          take: 10,
          orderBy: {
            date: 'desc'
          },
          select: {
            id: true,
            groupId: true,
            date: true,
            status: true,
            analyses: {
              take: 1,
              orderBy: {
                createdAt: 'desc' as const
              },
              select: {
                riskDetection: true,
                supervisorStatus: true
              }
            }
          }
        }
      }
    });

    if (!fellow) {
      return NextResponse.json({ error: 'Fellow not found' }, { status: 404 });
    }

    return NextResponse.json({
      fellow: {
        id: fellow.id,
        name: fellow.name,
        email: fellow.email,
        status: fellow.status,
        createdAt: fellow.createdAt,
        sessionCount: fellow._count.meetings,
        sessions: fellow.meetings.map(m => ({
          id: m.id,
          groupId: m.groupId,
          date: m.date.toISOString(),
          status: m.status,
          hasRisk: m.analyses[0]?.riskDetection?.status === 'RISK',
          supervisorStatus: m.analyses[0]?.supervisorStatus || null
        }))
      }
    });
  } catch (error) {
    console.error('Fellow fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fellow: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingFellow = await prisma.fellow.findFirst({
      where: {
        id,
        supervisorId: session.user.id,
        deletedAt: null
      }
    });

    if (!existingFellow) {
      return NextResponse.json({ error: 'Fellow not found' }, { status: 404 });
    }

    if (body.email && body.email !== existingFellow.email) {
      const emailExists = await prisma.fellow.findUnique({
        where: { email: body.email }
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'A fellow with this email already exists' },
          { status: 400 }
        );
      }
    }

    const fellow = await prisma.fellow.update({
      where: { id },
      data: {
        name: body.name ?? existingFellow.name,
        email: body.email ?? existingFellow.email,
        status: body.status ?? existingFellow.status
      }
    });

    return NextResponse.json({
      message: 'Fellow updated successfully',
      fellow: {
        id: fellow.id,
        name: fellow.name,
        email: fellow.email,
        status: fellow.status
      }
    });
  } catch (error) {
    console.error('Fellow update error:', error);
    return NextResponse.json(
      { error: 'Failed to update fellow: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existingFellow = await prisma.fellow.findFirst({
      where: {
        id,
        supervisorId: session.user.id,
        deletedAt: null
      }
    });

    if (!existingFellow) {
      return NextResponse.json({ error: 'Fellow not found' }, { status: 404 });
    }

    await prisma.fellow.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Fellow deleted successfully' });
  } catch (error) {
    console.error('Fellow delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fellow: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
