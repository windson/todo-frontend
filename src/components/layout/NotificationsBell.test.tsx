import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Notification } from '@/types';
import i18n from '@/i18n/config';

const getNotificationsMock = vi.fn();
const markNotificationMock = vi.fn();
vi.mock('@/api/notifications', () => ({
  getNotifications: (...args: unknown[]) => getNotificationsMock(...args),
  markNotification: (...args: unknown[]) => markNotificationMock(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { NotificationsBell } from '@/components/layout/NotificationsBell';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    type: 'reminder.due',
    payload: { todoId: 'todo-1', todoTitle: 'Launch website' },
    read: false,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

beforeEach(async () => {
  await i18n.changeLanguage('en');
  getNotificationsMock.mockReset();
  markNotificationMock.mockReset();
});

describe('NotificationsBell', () => {
  it('shows the unread count badge and lists unread notifications', async () => {
    getNotificationsMock.mockResolvedValue([
      makeNotification(),
      makeNotification({ id: 'notif-2', payload: { todoTitle: 'Pay invoice' } }),
    ]);

    renderWithClient(<NotificationsBell />);

    // Badge reflects the unread count.
    await waitFor(() => {
      expect(
        screen.getByLabelText('2 unread notifications')
      ).toBeInTheDocument();
    });

    // Opening the dropdown renders the unread items.
    fireEvent.click(screen.getByLabelText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('Reminder: Launch website')).toBeInTheDocument();
      expect(screen.getByText('Reminder: Pay invoice')).toBeInTheDocument();
    });
  });

  it('marks a notification as read via the mutation', async () => {
    getNotificationsMock.mockResolvedValue([makeNotification()]);
    markNotificationMock.mockResolvedValue(makeNotification({ read: true }));

    renderWithClient(<NotificationsBell />);

    fireEvent.click(await screen.findByLabelText('Notifications'));

    const markButton = await screen.findByLabelText('Mark as read');
    fireEvent.click(markButton);

    await waitFor(() => {
      expect(markNotificationMock).toHaveBeenCalledWith('notif-1', true);
    });
  });

  it("renders an empty state when there are no unread notifications", async () => {
    getNotificationsMock.mockResolvedValue([]);

    renderWithClient(<NotificationsBell />);

    fireEvent.click(await screen.findByLabelText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    });
  });

  it('localizes the bell, badge and mark-as-read labels (en and es)', async () => {
    getNotificationsMock.mockResolvedValue([makeNotification()]);

    renderWithClient(<NotificationsBell />);

    // English (default).
    fireEvent.click(await screen.findByLabelText('Notifications'));
    expect(await screen.findByLabelText('1 unread notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Mark as read')).toHaveAttribute('title', 'Mark as read');

    // Switching to Spanish updates the labels without remounting.
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    expect(screen.getByLabelText('Notificaciones')).toBeInTheDocument();
    expect(screen.getByLabelText('1 notificaciones sin leer')).toBeInTheDocument();
    expect(screen.getByLabelText('Marcar como leída')).toHaveAttribute(
      'title',
      'Marcar como leída'
    );
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });
});
