'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Notifications } from '@/components/dashboard/notifications';
import { UserMenu } from '@/components/dashboard/user-menu';
import { UserTabs } from '@/components/dashboard/user-tabs';

export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const showUserTabs = !pathname?.includes('/notifications');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Notifications />
              {session.user && <UserMenu user={session.user} />}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showUserTabs && (
          <div className="mt-6">
            <UserTabs />
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
