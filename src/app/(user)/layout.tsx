import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { Notifications } from '@/components/dashboard/notifications';
import { UserMenu } from '@/components/dashboard/user-menu';
import { UserTabs } from '@/components/dashboard/user-tabs';

export default async function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

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
        <div className="mt-6">
          <UserTabs />
        </div>

        {children}
      </div>
    </div>
  );
}
