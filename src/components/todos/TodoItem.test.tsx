import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Priority, type Todo } from '@/types';

// SubtaskList (rendered by TodoItem for top-level todos) uses the todos hooks;
// stub the api module so the QueryClient has something to call.
vi.mock('@/api/todos', () => ({
  getTodos: vi.fn().mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 }),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  bulkUpdateTodos: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { TodoItem } from '@/components/todos/TodoItem';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Launch website',
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

function renderItem(todo: Todo) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = (ui: ReactNode) => (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
  return render(
    wrapper(
      <TodoItem
        todo={todo}
        onToggle={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    )
  );
}

describe('TodoItem assignee & share badges', () => {
  it('shows the assignee name when the todo is assigned', () => {
    renderItem(
      makeTodo({
        assigneeId: 'u-2',
        assignee: { id: 'u-2', email: 'casey@example.com', name: 'Casey' },
      })
    );
    expect(screen.getByText('Casey')).toBeInTheDocument();
  });

  it('falls back to the assignee email when there is no name', () => {
    renderItem(
      makeTodo({
        assigneeId: 'u-2',
        assignee: { id: 'u-2', email: 'nameless@example.com', name: null },
      })
    );
    expect(screen.getByText('nameless@example.com')).toBeInTheDocument();
  });

  it('shows a shared count badge when the todo has shares', () => {
    renderItem(
      makeTodo({
        shares: [
          {
            id: 's1',
            role: 'VIEWER',
            todoId: 'todo-1',
            userId: 'u-2',
            user: { id: 'u-2', email: 'casey@example.com', name: 'Casey' },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      })
    );
    expect(screen.getByText(/Shared/)).toBeInTheDocument();
  });

  it('shows no assignee badge when unassigned', () => {
    renderItem(makeTodo());
    expect(screen.queryByText('Casey')).not.toBeInTheDocument();
  });

  it('gives the completion checkbox an accessible name', () => {
    renderItem(makeTodo({ title: 'Water plants' }));
    expect(
      screen.getByRole('checkbox', { name: 'Mark Water plants as complete' })
    ).toBeInTheDocument();
  });
});
