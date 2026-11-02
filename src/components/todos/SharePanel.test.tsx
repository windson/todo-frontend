import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Priority, type Share, type Todo } from '@/types';

const getSharesMock = vi.fn();
const createShareMock = vi.fn();
const updateShareMock = vi.fn();
const deleteShareMock = vi.fn();
vi.mock('@/api/shares', () => ({
  getShares: (...args: unknown[]) => getSharesMock(...args),
  createShare: (...args: unknown[]) => createShareMock(...args),
  updateShare: (...args: unknown[]) => updateShareMock(...args),
  deleteShare: (...args: unknown[]) => deleteShareMock(...args),
}));

const updateTodoMock = vi.fn();
vi.mock('@/api/todos', () => ({
  getTodos: vi.fn().mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 }),
  createTodo: vi.fn(),
  updateTodo: (...args: unknown[]) => updateTodoMock(...args),
  deleteTodo: vi.fn(),
  bulkUpdateTodos: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { SharePanel } from '@/components/todos/SharePanel';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Shared todo',
    description: null,
    completed: false,
    priority: Priority.MEDIUM,
    startDate: null,
    dueDate: null,
    recurrenceRule: null,
    recurrenceInterval: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    categoryId: null,
    category: null,
    tags: [],
    order: 0,
    parentId: null,
    assigneeId: null,
    ...overrides,
  };
}

function makeShare(overrides: Partial<Share> = {}): Share {
  return {
    id: 'share-1',
    role: 'EDITOR',
    todoId: 'todo-1',
    userId: 'u-2',
    user: { id: 'u-2', email: 'casey@example.com', name: 'Casey' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  getSharesMock.mockReset();
  createShareMock.mockReset();
  updateShareMock.mockReset();
  deleteShareMock.mockReset();
  updateTodoMock.mockReset();
});

describe('SharePanel', () => {
  it('lists existing shares for a managed todo', async () => {
    getSharesMock.mockResolvedValue([makeShare()]);

    renderWithClient(<SharePanel todo={makeTodo()} canManage />);

    await waitFor(() => {
      expect(screen.getByText('casey@example.com')).toBeInTheDocument();
    });
  });

  it('invites a user by exact email with the chosen role', async () => {
    getSharesMock.mockResolvedValue([]);
    createShareMock.mockResolvedValue(makeShare());

    renderWithClient(<SharePanel todo={makeTodo()} canManage />);

    await waitFor(() => {
      expect(screen.getByText('Not shared with anyone yet.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Invite by email'), {
      target: { value: 'casey@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Share/i }));

    await waitFor(() => {
      expect(createShareMock).toHaveBeenCalledWith('todo-1', {
        email: 'casey@example.com',
        role: 'VIEWER',
      });
    });
  });

  it('hides the invite form when the user cannot manage the todo', async () => {
    getSharesMock.mockResolvedValue([makeShare()]);

    renderWithClient(<SharePanel todo={makeTodo()} canManage={false} />);

    await waitFor(() => {
      expect(screen.getByText('casey@example.com')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('Invite by email')).not.toBeInTheDocument();
    expect(
      screen.getByText('Only the owner can change the assignee.')
    ).toBeInTheDocument();
  });

  it('changes the assignee via the update-todo mutation', async () => {
    getSharesMock.mockResolvedValue([makeShare()]);
    updateTodoMock.mockResolvedValue(makeTodo({ assigneeId: 'u-2' }));

    renderWithClient(<SharePanel todo={makeTodo()} canManage />);

    await waitFor(() => {
      expect(screen.getByText('casey@example.com')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Assignee'), {
      target: { value: 'u-2' },
    });

    await waitFor(() => {
      expect(updateTodoMock).toHaveBeenCalledWith('todo-1', { assigneeId: 'u-2' });
    });
  });
});
