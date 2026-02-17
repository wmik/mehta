'use client';

import { SessionProvider } from 'next-auth/react';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AnalyticsProvider />
      {children}
    </SessionProvider>
  );
}
