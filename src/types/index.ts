export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

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
  dueDate: string | null;
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

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  categoryId?: string;
  tagIds?: string[];
  parentId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string | null;
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
