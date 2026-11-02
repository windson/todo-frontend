import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the todos API so no real network request is made by the mutation hooks.
const createTodoMock = vi.fn();
const updateTodoMock = vi.fn();
const deleteTodoMock = vi.fn();
vi.mock('@/api/todos', () => ({
  getTodos: vi.fn(),
  getTodo: vi.fn(),
  createTodo: (...args: unknown[]) => createTodoMock(...args),
  updateTodo: (...args: unknown[]) => updateTodoMock(...args),
  deleteTodo: (...args: unknown[]) => deleteTodoMock(...args),
  bulkUpdateTodos: vi.fn(),
}));

// react-hot-toast is called by the mutation hooks; stub it out.
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { SubtaskList } from '@/components/todos/SubtaskList';
import { Priority, type Todo } from '@/types';

function makeSubtask(overrides: Partial<Todo>): Todo {
  return {
    id: 'sub-1',
    title: 'A subtask',
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
    parentId: 'parent-1',
    ...overrides,
  };
}

function makeParent(): Todo {
  return {
    id: 'parent-1',
    title: 'Parent todo',
    description: null,
    completed: false,
    priority: Priority.HIGH,
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
    children: [
      makeSubtask({ id: 'sub-1', title: 'Write copy', completed: true }),
      makeSubtask({ id: 'sub-2', title: 'Ship it', completed: false }),
    ],
    progress: { total: 2, completed: 1 },
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
  createTodoMock.mockReset();
  updateTodoMock.mockReset();
  deleteTodoMock.mockReset();
});

describe('SubtaskList', () => {
  it('renders a progress indicator reflecting completed/total subtasks', () => {
    renderWithClient(<SubtaskList todo={makeParent()} />);

    expect(screen.getByText('Subtasks 1/2')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Subtask progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('expands to show subtasks and toggles one via the update mutation', async () => {
    updateTodoMock.mockResolvedValue({});
    renderWithClient(<SubtaskList todo={makeParent()} />);

    // Subtasks are collapsed initially.
    expect(screen.queryByText('Write copy')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand subtasks' }));

    expect(screen.getByText('Write copy')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    // Toggle the second (incomplete) subtask.
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(updateTodoMock).toHaveBeenCalledWith('sub-2', { completed: true });
    });
  });

  it('adds a subtask via the create mutation', async () => {
    createTodoMock.mockResolvedValue(makeSubtask({ id: 'sub-3' }));
    renderWithClient(<SubtaskList todo={makeParent()} />);

    fireEvent.click(screen.getByRole('button', { name: /Add subtask/ }));

    const input = screen.getByLabelText('New subtask title');
    fireEvent.change(input, { target: { value: 'New step' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(createTodoMock).toHaveBeenCalledWith({
        title: 'New step',
        parentId: 'parent-1',
      });
    });
  });
});
