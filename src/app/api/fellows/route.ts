import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { trackServer, ANALYTICS_EVENTS } from '@/lib/analytics-server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fellows = await prisma.fellow.findMany({
      where: {
        supervisorId: session.user.id,
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            meetings: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      fellows: fellows.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        status: f.status,
        createdAt: f.createdAt,
        sessionCount: f._count.meetings
      }))
    });
  } catch (error) {
    console.error('Fellows fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fellows: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const existingFellow = await prisma.fellow.findUnique({
      where: { email }
    });

    if (existingFellow) {
      return NextResponse.json(
        { error: 'A fellow with this email already exists' },
        { status: 400 }
      );
    }

    const fellow = await prisma.fellow.create({
      data: {
        name,
        email,
        supervisorId: session.user.id
      }
    });

    trackServer(ANALYTICS_EVENTS.FELLOW_CREATED, {
      fellowId: fellow.id,
      name: fellow.name,
      email: fellow.email
    });

    return NextResponse.json({
      message: 'Fellow created successfully',
      fellow: {
        id: fellow.id,
        name: fellow.name,
        email: fellow.email,
        status: fellow.status,
        createdAt: fellow.createdAt
      }
    });
  } catch (error) {
    console.error('Fellow creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create fellow: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
