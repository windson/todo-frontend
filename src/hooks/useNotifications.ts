import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotification, type NotificationQuery } from '@/api/notifications';
import toast from 'react-hot-toast';

export function useNotifications(query?: NotificationQuery, enabled = true) {
  return useQuery({
    queryKey: ['notifications', query ?? {}],
    queryFn: () => getNotifications(query),
    enabled,
  });
}

/** Unread in-app notifications, used by the Header bell. */
export function useUnreadNotifications(enabled = true) {
  return useNotifications({ read: false }, enabled);
}

export function useMarkNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, read = true }: { id: string; read?: boolean }) =>
      markNotification(id, read),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update notification');
    },
  });
}
