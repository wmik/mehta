'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User } from 'lucide-react';

export function UserTabs() {
  const pathname = usePathname();
  const activeTab = pathname === '/settings' ? 'settings' : 'profile';

  return (
    <Tabs defaultValue={activeTab} className="max-w-4xl mx-auto">
      <TabsList className="mb-6">
        <Link href="/profile">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </Link>
        <Link href="/settings">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}
