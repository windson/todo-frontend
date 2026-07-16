import { apiClient } from './client';
import type { Tag, CreateTagInput, UpdateTagInput } from '@/types';

export async function getTags(): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>('/tags');
  return response.data;
}

export async function getTag(id: string): Promise<Tag> {
  const response = await apiClient.get<Tag>(`/tags/${id}`);
  return response.data;
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const response = await apiClient.post<Tag>('/tags', input);
  return response.data;
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
  const response = await apiClient.patch<Tag>(`/tags/${id}`, input);
  return response.data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}

export async function addTagToTodo(todoId: string, tagId: string): Promise<void> {
  await apiClient.post(`/todos/${todoId}/tags`, { tagId });
}

export async function removeTagFromTodo(todoId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}/tags`, { data: { tagId } });
}
