import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useUnreadNotifications, useMarkNotification } from '@/hooks/useNotifications';
import { formatRelative } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

function notificationTitle(notification: Notification): string {
  const payload = notification.payload ?? {};
  const todoTitle = typeof payload.todoTitle === 'string' ? payload.todoTitle : null;
  if (notification.type === 'reminder.due') {
    return todoTitle ? `Reminder: ${todoTitle}` : 'A reminder is due';
  }
  return todoTitle ?? notification.type;
}

export function NotificationsBell() {
  const { data: notifications } = useUnreadNotifications();
  const markMutation = useMarkNotification();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unread = notifications ?? [];
  const unreadCount = unread.length;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                onClick={() =>
                  unread.forEach((n) => markMutation.mutate({ id: n.id, read: true }))
                }
                disabled={markMutation.isPending}
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto py-1">
            {unreadCount === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                You're all caught up.
              </li>
            ) : (
              unread.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {notificationTitle(notification)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => markMutation.mutate({ id: notification.id, read: true })}
                    disabled={markMutation.isPending}
                    className="mt-0.5 shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700 disabled:opacity-50"
                    aria-label="Mark as read"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
