import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const SAMPLING_RATE = 0.1;

let mixpanelClient: typeof mixpanel | null = null;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn('[Analytics] Mixpanel token missing');
    return;
  }

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      api_host: process.env.MIXPANEL_API_HOST,
      debug: process.env.NODE_ENV === 'development',
      autocapture: true,
      track_pageview: false,
      record_sessions_percent: 100
    });
    mixpanelClient = mixpanel;
  } catch (error) {
    console.error('[Analytics] Failed to initialize Mixpanel:', error);
  }
};

export const ANALYTICS_EVENTS = {
  USER_SIGNED_IN: 'User Signed In',
  USER_SIGNED_UP: 'User Signed Up',
  USER_SIGNED_OUT: 'User Signed Out',
  SESSION_CREATED: 'Session Created',
  SESSION_VIEWED: 'Session Viewed',
  SESSION_ANALYZED: 'Session Analyzed',
  SESSION_VALIDATED: 'Session Validated',
  SESSION_REJECTED: 'Session Rejected',
  TRANSCRIPT_UPLOADED: 'Transcript Uploaded',
  TRANSCRIPT_DOWNLOADED: 'Transcript Downloaded',
  ANALYSIS_COMPLETED: 'Analysis Completed',
  FELLOW_CREATED: 'Fellow Created',
  FELLOW_VIEWED: 'Fellow Viewed',
  FELLOW_UPDATED: 'Fellow Updated',
  FELLOW_DELETED: 'Fellow Deleted',
  PAGE_VIEWED: 'Page Viewed',
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  ONBOARDING_SKIPPED: 'Onboarding Skipped',
  ONBOARDING_STEP_VIEWED: 'Onboarding Step Viewed'
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

function shouldSample(): boolean {
  return Math.random() < SAMPLING_RATE;
}

export const track = <T extends Record<string, unknown>>(
  eventName: AnalyticsEvent,
  properties?: T
): void => {
  if (!MIXPANEL_TOKEN || !mixpanelClient) {
    return;
  }

  if (!shouldSample()) {
    return;
  }

  try {
    mixpanelClient.track(eventName, {
      ...properties,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('[Analytics] Track error:', error);
  }
};

export const trackPageView = (
  pageName: string,
  properties?: Record<string, unknown>
): void => {
  track(ANALYTICS_EVENTS.PAGE_VIEWED, {
    page: pageName,
    ...properties
  } as Record<string, unknown>);
};

export const identifyUser = (
  userId: string,
  traits?: {
    name?: string;
    email?: string;
    role?: string;
    createdAt?: Date;
  }
): void => {
  if (!mixpanelClient) {
    return;
  }

  try {
    mixpanelClient.identify(userId);

    if (traits) {
      mixpanelClient.people.set(userId, {
        $name: traits.name,
        $email: traits.email,
        role: traits.role,
        createdAt: traits.createdAt
      });
    }
  } catch (error) {
    console.error('[Analytics] Identify error:', error);
  }
};

export const resetUser = (): void => {
  if (!mixpanelClient) {
    return;
  }

  try {
    mixpanelClient.reset();
  } catch (error) {
    console.error('[Analytics] Reset error:', error);
  }
};
