'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initMixpanel, identifyUser, trackPageView } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string;
      };
      identifyUser(user.id, {
        name: user.name || undefined,
        email: user.email || undefined,
        role: user.role || 'supervisor'
      });
    }
  }, [session]);

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
