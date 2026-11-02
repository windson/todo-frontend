import type { Priority, SavedViewFilters, TodoFilters } from '@/types';

/**
 * Convert the in-memory TodoFilters into the serialisable SavedViewFilters
 * shape stored on the backend (a subset of the GET /api/todos query params).
 * `completed` becomes the string 'true'/'false' and `priority` becomes a
 * comma-separated string, matching how the backend parses query params.
 */
export function toSavedViewFilters(filters: TodoFilters): SavedViewFilters {
  const result: SavedViewFilters = {};

  if (filters.search) result.search = filters.search;
  if (filters.completed !== undefined) result.completed = filters.completed ? 'true' : 'false';
  if (filters.priority !== undefined) {
    result.priority = Array.isArray(filters.priority)
      ? filters.priority.join(',')
      : filters.priority;
  }
  if (filters.categoryId) result.categoryId = filters.categoryId;
  if (filters.tagId) result.tagId = filters.tagId;
  if (filters.assigneeId) result.assigneeId = filters.assigneeId;
  if (filters.sharedWithMe !== undefined) result.sharedWithMe = filters.sharedWithMe ? 'true' : 'false';
  if (filters.dueFilter) result.dueFilter = filters.dueFilter;
  if (filters.sortBy && filters.sortBy !== 'order') result.sortBy = filters.sortBy;
  if (filters.sortOrder) result.sortOrder = filters.sortOrder;

  return result;
}

/**
 * Convert a stored SavedViewFilters back into the in-memory TodoFilters shape
 * so applying a saved view restores the filter UI state.
 */
export function fromSavedViewFilters(filters: SavedViewFilters): TodoFilters {
  const result: TodoFilters = {};

  if (filters.search) result.search = filters.search;
  if (filters.completed !== undefined) result.completed = filters.completed === 'true';
  if (filters.priority) {
    const parts = filters.priority.split(',').filter(Boolean) as Priority[];
    result.priority = parts.length > 1 ? parts : parts[0];
  }
  if (filters.categoryId) result.categoryId = filters.categoryId;
  if (filters.tagId) result.tagId = filters.tagId;
  if (filters.assigneeId) result.assigneeId = filters.assigneeId;
  if (filters.sharedWithMe !== undefined) result.sharedWithMe = filters.sharedWithMe === 'true';
  if (filters.dueFilter) result.dueFilter = filters.dueFilter;
  if (filters.sortBy) result.sortBy = filters.sortBy;
  if (filters.sortOrder) result.sortOrder = filters.sortOrder;

  return result;
}
