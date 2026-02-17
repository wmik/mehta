import { NextRequest, NextResponse } from 'next/server';
import mixpanel from 'mixpanel';

const MIXPANEL_SECRET = process.env.MIXPANEL_SECRET;
const SAMPLING_RATE = 0.1;

export async function POST(request: NextRequest) {
  if (!MIXPANEL_SECRET) {
    return NextResponse.json(
      { error: 'Mixpanel not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { event, properties, userId } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (!shouldSample()) {
      return NextResponse.json({ success: true, sampled: true });
    }

    const mp = mixpanel.init(MIXPANEL_SECRET, {
      debug: process.env.NODE_ENV === 'development'
    });

    const trackPayload = {
      ...properties,
      environment: process.env.NODE_ENV,
      $ip: request.headers.get('x-forwarded-for') || undefined
    };

    if (userId) {
      await mp.people.set(userId, {
        $name: properties?.name,
        $email: properties?.email,
        role: properties?.role,
        last_seen: new Date().toISOString()
      });
    }

    await mp.track(event, trackPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Server track error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

function shouldSample(): boolean {
  return Math.random() < SAMPLING_RATE;
}
