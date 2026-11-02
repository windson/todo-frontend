import { apiClient } from './client';
import type { Notification } from '@/types';

export interface NotificationQuery {
  read?: boolean;
  limit?: number;
  offset?: number;
}

export async function getNotifications(query?: NotificationQuery): Promise<Notification[]> {
  const params: Record<string, string> = {};
  if (query?.read !== undefined) params.read = String(query.read);
  if (query?.limit !== undefined) params.limit = String(query.limit);
  if (query?.offset !== undefined) params.offset = String(query.offset);

  const response = await apiClient.get<Notification[]>('/notifications', { params });
  return response.data;
}

export async function markNotification(id: string, read = true): Promise<Notification> {
  const response = await apiClient.patch<Notification>(`/notifications/${id}`, { read });
  return response.data;
}
