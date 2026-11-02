import { apiClient } from './client';
import type { Comment, CreateCommentInput, UpdateCommentInput } from '@/types';

export async function getComments(todoId: string): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>(`/todos/${todoId}/comments`);
  return response.data;
}

export async function createComment(
  todoId: string,
  input: CreateCommentInput
): Promise<Comment> {
  const response = await apiClient.post<Comment>(`/todos/${todoId}/comments`, input);
  return response.data;
}

export async function updateComment(
  todoId: string,
  commentId: string,
  input: UpdateCommentInput
): Promise<Comment> {
  const response = await apiClient.patch<Comment>(
    `/todos/${todoId}/comments/${commentId}`,
    input
  );
  return response.data;
}

export async function deleteComment(todoId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}/comments/${commentId}`);
}
