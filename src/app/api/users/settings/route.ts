import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  UserSettings,
  getMergedSettings,
  getSettingsForResponse,
  encryptLlmKey
} from '@/lib/settings';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        createdAt: true,
        settings: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = getSettingsForResponse(
      user.settings as UserSettings | null,
      user.id,
      user.createdAt
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body as { settings: Partial<UserSettings> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        createdAt: true,
        settings: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSettings = getMergedSettings(
      user.settings as UserSettings | null
    );

    const updatedSettings: UserSettings = {
      ...currentSettings,
      aiProvider: settings.aiProvider ?? currentSettings.aiProvider,
      llmUrl: settings.llmUrl ?? currentSettings.llmUrl,
      theme: settings.theme ?? currentSettings.theme,
      compactMode: settings.compactMode ?? currentSettings.compactMode,
      notifications: {
        ...currentSettings.notifications,
        ...settings.notifications
      }
    };

    if (settings.llmKey && settings.llmKey.length > 0) {
      updatedSettings.llmKey = encryptLlmKey(
        settings.llmKey,
        user.id,
        user.createdAt
      );
    } else {
      updatedSettings.llmKey = currentSettings.llmKey;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { settings: updatedSettings as any }
    });

    const responseSettings = getSettingsForResponse(
      updatedSettings,
      user.id,
      user.createdAt
    );

    return NextResponse.json({ settings: responseSettings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
