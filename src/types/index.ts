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

/** Role a user holds on a todo shared with them. */
export const ShareRole = {
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
} as const;

export type ShareRole = (typeof ShareRole)[keyof typeof ShareRole];

/** Minimal public info about a user (for assignee / share display). */
export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

/** A share grants a user access to a todo at a given role. */
export interface Share {
  id: string;
  role: ShareRole;
  todoId: string;
  userId: string;
  user: PublicUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareInput {
  email: string;
  role?: ShareRole;
}

export interface UpdateShareInput {
  role: ShareRole;
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
  assigneeId: string | null;
  assignee?: PublicUser | null;
  shares?: Share[];
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

export const ReminderChannel = {
  INAPP: 'INAPP',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
} as const;

export type ReminderChannel = (typeof ReminderChannel)[keyof typeof ReminderChannel];

export interface Reminder {
  id: string;
  remindAt: string;
  channel: ReminderChannel;
  sentAt: string | null;
  todoId: string;
  userId: string;
  createdAt: string;
}

export interface CreateReminderInput {
  remindAt: string;
  channel?: ReminderChannel;
}

export interface UpdateReminderInput {
  remindAt?: string;
  channel?: ReminderChannel;
}

export interface Notification {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  read: boolean;
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
  assigneeId?: string;
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
  assigneeId?: string | null;
  order?: number;
}

export interface TodoFilters {
  search?: string;
  completed?: boolean;
  priority?: Priority | Priority[];
  categoryId?: string;
  tagId?: string;
  assigneeId?: string;
  sharedWithMe?: boolean;
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

export type BulkUpdateInput =
  | { operation: 'complete'; ids: string[] }
  | { operation: 'uncomplete'; ids: string[] }
  | { operation: 'delete'; ids: string[] }
  | { operation: 'setPriority'; ids: string[]; priority: Priority }
  | { operation: 'setCategory'; ids: string[]; categoryId: string | null }
  | { operation: 'addTags'; ids: string[]; tagIds: string[] }
  | { operation: 'removeTags'; ids: string[]; tagIds: string[] }
  | { operation: 'setAssignee'; ids: string[]; assigneeId: string | null };

/**
 * The persisted shape of a SavedView's filters. A subset of TodoFilters the
 * frontend round-trips (see SavedView). Mirrors the backend
 * SavedViewFiltersSchema; all fields optional.
 */
export interface SavedViewFilters {
  search?: string;
  completed?: 'true' | 'false';
  priority?: string;
  categoryId?: string;
  tagId?: string;
  assigneeId?: string;
  sharedWithMe?: 'true' | 'false';
  dueFilter?: 'today' | 'upcoming' | 'overdue';
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SavedView {
  id: string;
  name: string;
  filters: SavedViewFilters;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedViewInput {
  name: string;
  filters: SavedViewFilters;
}

export interface UpdateSavedViewInput {
  name?: string;
  filters?: SavedViewFilters;
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
