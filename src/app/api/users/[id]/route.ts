import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions, isAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const isAllowedAdmin = isAdmin(session.user);
    const isOwnProfile = session.user.id === id;

    if (!isAllowedAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser || existingUser.deletedAt) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email }
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name?: string | null;
      email?: string;
      role?: string;
      password?: string;
    } = {};

    if (body.name !== undefined) {
      updateData.name = body.name || null;
    }
    if (body.email) {
      updateData.email = body.email;
    }
    if (body.role) {
      if (body.role !== 'supervisor' && body.role !== 'admin') {
        return NextResponse.json(
          { error: 'Invalid role. Must be "supervisor" or "admin"' },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser || existingUser.deletedAt) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
