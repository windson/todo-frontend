import { apiClient } from './client';
import type { Attachment, CreateAttachmentInput } from '@/types';

export async function getAttachments(todoId: string): Promise<Attachment[]> {
  const response = await apiClient.get<Attachment[]>(`/todos/${todoId}/attachments`);
  return response.data;
}

export async function createAttachment(
  todoId: string,
  input: CreateAttachmentInput
): Promise<Attachment> {
  const response = await apiClient.post<Attachment>(
    `/todos/${todoId}/attachments`,
    input
  );
  return response.data;
}

export async function deleteAttachment(
  todoId: string,
  attachmentId: string
): Promise<void> {
  await apiClient.delete(`/todos/${todoId}/attachments/${attachmentId}`);
}
