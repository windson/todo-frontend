import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { DragEndEvent } from '@dnd-kit/core';

// Capture the onDragEnd handler passed to DndContext so the test can simulate
// a drop without real pointer events. The draggable/droppable hooks are stubbed
// to inert values.
let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
  }) => {
    capturedOnDragEnd = onDragEnd;
    return <div>{children}</div>;
  },
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, isDragging: false }),
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
}));

const updateMutate = vi.fn();
const useTodosMock = vi.fn();

vi.mock('@/hooks/useTodos', () => ({
  useTodos: (...args: unknown[]) => useTodosMock(...args),
  useUpdateTodo: () => ({ mutate: updateMutate }),
}));

import { Board } from '@/pages/Board';
import { Priority, type Todo } from '@/types';

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 'todo-1',
    title: 'Task',
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

describe('Board (Kanban) drag', () => {
  beforeEach(() => {
    capturedOnDragEnd = undefined;
    updateMutate.mockReset();
    useTodosMock.mockReset();
  });

  it('marks a todo completed when dropped on the Completed column', () => {
    useTodosMock.mockReturnValue({
      data: { data: [makeTodo({ id: 'a', completed: false })], total: 1, limit: 100, offset: 0 },
      isLoading: false,
    });

    render(<Board />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    capturedOnDragEnd?.({
      active: { id: 'a' },
      over: { id: 'completed' },
    } as DragEndEvent);

    expect(updateMutate).toHaveBeenCalledWith({ id: 'a', input: { completed: true } });
  });

  it('updates priority when dropped on a priority column in priority mode', () => {
    useTodosMock.mockReturnValue({
      data: { data: [makeTodo({ id: 'a', priority: Priority.LOW })], total: 1, limit: 100, offset: 0 },
      isLoading: false,
    });

    render(<Board />);

    // Switch to "By priority" grouping.
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'priority' } });

    capturedOnDragEnd?.({
      active: { id: 'a' },
      over: { id: Priority.URGENT },
    } as DragEndEvent);

    expect(updateMutate).toHaveBeenCalledWith({ id: 'a', input: { priority: Priority.URGENT } });
  });

  it('is a no-op when dropped on the column it already belongs to', () => {
    useTodosMock.mockReturnValue({
      data: { data: [makeTodo({ id: 'a', completed: false })], total: 1, limit: 100, offset: 0 },
      isLoading: false,
    });

    render(<Board />);

    capturedOnDragEnd?.({
      active: { id: 'a' },
      over: { id: 'active' },
    } as DragEndEvent);

    expect(updateMutate).not.toHaveBeenCalled();
  });
});
