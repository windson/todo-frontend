import { apiClient } from './client';
import type { Share, CreateShareInput, UpdateShareInput, PublicUser } from '@/types';

export async function getShares(todoId: string): Promise<Share[]> {
  const response = await apiClient.get<Share[]>(`/todos/${todoId}/share`);
  return response.data;
}

export async function createShare(
  todoId: string,
  input: CreateShareInput
): Promise<Share> {
  const response = await apiClient.post<Share>(`/todos/${todoId}/share`, input);
  return response.data;
}

export async function updateShare(
  todoId: string,
  userId: string,
  input: UpdateShareInput
): Promise<Share> {
  const response = await apiClient.patch<Share>(
    `/todos/${todoId}/share/${userId}`,
    input
  );
  return response.data;
}

export async function deleteShare(todoId: string, userId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}/share/${userId}`);
}

/**
 * Look up a user to share with by EXACT email. Returns the matched user or
 * null. The backend never supports partial search, so this cannot enumerate
 * the user directory.
 */
export async function lookupUser(email: string): Promise<PublicUser | null> {
  const response = await apiClient.get<PublicUser | null>('/users/lookup', {
    params: { email },
  });
  return response.data;
}
