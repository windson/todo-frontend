import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// TodoForm pulls categories/tags via hooks; stub them so no provider is needed.
vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));
vi.mock('@/hooks/useTags', () => ({
  useTags: () => ({ data: [] }),
}));

import { TodoForm } from '@/components/todos/TodoForm';
import { Priority, RecurrenceRule, type Todo } from '@/types';

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    title: 'Existing',
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
    ...overrides,
  };
}

describe('TodoForm start date + recurrence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders start date and repeat controls', () => {
    render(
      <TodoForm isOpen onClose={vi.fn()} onSubmit={vi.fn()} isLoading={false} />
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Repeat')).toBeInTheDocument();
    // Interval only shows once a recurrence is chosen.
    expect(screen.queryByLabelText('Every (interval)')).not.toBeInTheDocument();
  });

  it('reveals the interval input when a recurrence is selected', () => {
    render(
      <TodoForm isOpen onClose={vi.fn()} onSubmit={vi.fn()} isLoading={false} />
    );

    fireEvent.change(screen.getByLabelText('Repeat'), {
      target: { value: RecurrenceRule.WEEKLY },
    });

    expect(screen.getByLabelText('Every (interval)')).toBeInTheDocument();
  });

  it('submits start date and recurrence fields on create', () => {
    const onSubmit = vi.fn();
    render(
      <TodoForm isOpen onClose={vi.fn()} onSubmit={onSubmit} isLoading={false} />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Standup' },
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2024-06-01' },
    });
    fireEvent.change(screen.getByLabelText('Repeat'), {
      target: { value: RecurrenceRule.WEEKLY },
    });
    fireEvent.change(screen.getByLabelText('Every (interval)'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Standup',
        startDate: '2024-06-01',
        recurrenceRule: RecurrenceRule.WEEKLY,
        recurrenceInterval: 2,
      })
    );
  });

  it('pre-fills recurrence fields when editing an existing recurring todo', () => {
    render(
      <TodoForm
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
        todo={makeTodo({ recurrenceRule: RecurrenceRule.MONTHLY, recurrenceInterval: 3 })}
      />
    );

    expect(screen.getByLabelText('Repeat')).toHaveValue(RecurrenceRule.MONTHLY);
    expect(screen.getByLabelText('Every (interval)')).toHaveValue(3);
  });
});
