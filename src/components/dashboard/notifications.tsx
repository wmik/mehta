'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Bell, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  custom: Record<string, unknown> | null;
}

interface ApiNotification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: Date;
  custom: Record<string, unknown> | null;
}

const fetcher = (url: string) =>
  fetch(url).then(res => res.json()) as Promise<{
    notifications: ApiNotification[];
    unreadCount: number;
  }>;

function mapDbToNotification(dbNotification: ApiNotification): Notification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    description: dbNotification.description,
    isRead: dbNotification.isRead,
    createdAt: dbNotification.createdAt,
    custom: dbNotification.custom
  };
}

export function Notifications() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data, mutate } = useSWR<{
    notifications: ApiNotification[];
    unreadCount: number;
  }>('/api/notifications', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false
  });

  const notifications = (data?.notifications ?? []).map(mapDbToNotification);
  const unreadCount =
    data?.unreadCount ?? notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id })
        });
        mutate();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [mutate]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      mutate();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [mutate]);

  const getIcon = (notification: Notification) => {
    const custom = notification.custom as { type?: string } | null;
    const type = custom?.type ?? 'info';
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-none relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="mt-0.5">{getIcon(notification)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-none"
            onClick={() => {
              setOpen(false);
              router.push('/notifications');
            }}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
