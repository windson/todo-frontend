import { apiClient } from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters, PaginatedResponse, BulkUpdateInput } from '@/types';

export async function getTodos(filters?: TodoFilters): Promise<PaginatedResponse<Todo>> {
  const params: Record<string, string> = {};

  if (filters) {
    if (filters.search) params.search = filters.search;
    if (filters.completed !== undefined) params.completed = String(filters.completed);
    if (filters.priority) {
      params.priority = Array.isArray(filters.priority)
        ? filters.priority.join(',')
        : filters.priority;
    }
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.tagId) params.tagId = filters.tagId;
    if (filters.assigneeId) params.assigneeId = filters.assigneeId;
    if (filters.sharedWithMe !== undefined) params.sharedWithMe = String(filters.sharedWithMe);
    if (filters.dueBefore) params.dueBefore = filters.dueBefore;
    if (filters.dueAfter) params.dueAfter = filters.dueAfter;
    if (filters.dueFilter) params.dueFilter = filters.dueFilter;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.limit !== undefined) params.limit = String(filters.limit);
    if (filters.offset !== undefined) params.offset = String(filters.offset);
  }

  const response = await apiClient.get<Todo[]>('/todos', { params });
  const total = parseInt(response.headers['x-total-count'] || '0', 10);

  return {
    data: response.data,
    total,
    limit: filters?.limit || 20,
    offset: filters?.offset || 0,
  };
}

export async function getTodo(id: string): Promise<Todo> {
  const response = await apiClient.get<Todo>(`/todos/${id}`);
  return response.data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await apiClient.post<Todo>('/todos', input);
  return response.data;
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  const response = await apiClient.patch<Todo>(`/todos/${id}`, input);
  return response.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}

export async function bulkUpdateTodos(input: BulkUpdateInput): Promise<void> {
  await apiClient.post('/todos/bulk', input);
}
