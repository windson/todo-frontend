import { apiClient } from './client';
import type { SavedView, CreateSavedViewInput, UpdateSavedViewInput } from '@/types';

export async function getSavedViews(): Promise<SavedView[]> {
  const response = await apiClient.get<SavedView[]>('/views');
  return response.data;
}

export async function getSavedView(id: string): Promise<SavedView> {
  const response = await apiClient.get<SavedView>(`/views/${id}`);
  return response.data;
}

export async function createSavedView(input: CreateSavedViewInput): Promise<SavedView> {
  const response = await apiClient.post<SavedView>('/views', input);
  return response.data;
}

export async function updateSavedView(id: string, input: UpdateSavedViewInput): Promise<SavedView> {
  const response = await apiClient.patch<SavedView>(`/views/${id}`, input);
  return response.data;
}

export async function deleteSavedView(id: string): Promise<void> {
  await apiClient.delete(`/views/${id}`);
}
