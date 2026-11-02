export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export const RecurrenceRule = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export type RecurrenceRule = (typeof RecurrenceRule)[keyof typeof RecurrenceRule];

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  _count?: {
    todos: number;
  };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: {
    todos: number;
  };
}

export interface TodoTag {
  todoId: string;
  tagId: string;
  tag: Tag;
}

export interface SubtaskProgress {
  total: number;
  completed: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  recurrenceRule: RecurrenceRule | null;
  recurrenceInterval: number;
  recurrenceGeneratedId?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category: Category | null;
  tags: Tag[];
  order: number;
  parentId: string | null;
  children?: Todo[];
  progress?: SubtaskProgress;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  todoId: string;
  createdAt: string;
}

export interface CreateAttachmentInput {
  filename: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface Comment {
  id: string;
  body: string;
  todoId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  todoId: string;
  userId: string;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  recurrenceRule?: RecurrenceRule;
  recurrenceInterval?: number;
  categoryId?: string;
  tagIds?: string[];
  parentId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  startDate?: string | null;
  dueDate?: string | null;
  recurrenceRule?: RecurrenceRule | null;
  recurrenceInterval?: number;
  categoryId?: string | null;
  parentId?: string | null;
  order?: number;
}

export interface TodoFilters {
  search?: string;
  completed?: boolean;
  priority?: Priority | Priority[];
  categoryId?: string;
  tagId?: string;
  dueBefore?: string;
  dueAfter?: string;
  dueFilter?: 'today' | 'upcoming' | 'overdue';
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'order';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export interface BulkUpdateInput {
  ids: string[];
  operation: 'complete' | 'uncomplete' | 'delete';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthResponse = User;
