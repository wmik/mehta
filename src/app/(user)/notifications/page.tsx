'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Bell, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

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

export default function NotificationsPage() {
  const { data: auth } = useSession();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, mutate } = useSWR<{
    notifications: ApiNotification[];
    unreadCount: number;
  }>('/api/notifications', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false
  });

  const allNotifications = (data?.notifications ?? []).map(mapDbToNotification);
  const notifications =
    filter === 'unread'
      ? allNotifications.filter(n => !n.isRead)
      : allNotifications;
  const unreadCount = data?.unreadCount ?? 0;

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
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="rounded-none"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-none"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="rounded-none"
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {filter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map(notification => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getIcon(notification)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}
