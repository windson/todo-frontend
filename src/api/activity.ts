import { apiClient } from './client';
import type { ActivityLogEntry } from '@/types';

export async function getActivity(todoId: string): Promise<ActivityLogEntry[]> {
  const response = await apiClient.get<ActivityLogEntry[]>(`/todos/${todoId}/activity`);
  return response.data;
}
