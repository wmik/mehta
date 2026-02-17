import { ANALYTICS_EVENTS, AnalyticsEvent } from './analytics';

const MIXPANEL_API = '/api/analytics/track';
const SAMPLING_RATE = 0.1;

interface ServerTrackProperties {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

function shouldSample(): boolean {
  return Math.random() < SAMPLING_RATE;
}

export async function trackServer(
  eventName: AnalyticsEvent,
  properties?: ServerTrackProperties
): Promise<void> {
  if (!shouldSample()) {
    return;
  }

  try {
    await fetch(MIXPANEL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        userId: properties?.userId
      })
    });
  } catch (error) {
    console.error('[Analytics] Server track error:', error);
  }
}

export { ANALYTICS_EVENTS };
