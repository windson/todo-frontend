import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useTodos, useUpdateTodo } from '@/hooks/useTodos';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import { Priority, type Todo } from '@/types';
import { useTranslation } from 'react-i18next';

type BoardMode = 'status' | 'priority';

interface Column {
  id: string;
  title: string;
  /** Does a todo currently belong to this column? */
  matches: (todo: Todo) => boolean;
  /** The update payload to move a todo into this column. */
  toUpdate: () => Partial<{ completed: boolean; priority: Priority }>;
}

const statusColumns: Column[] = [
  {
    id: 'active',
    title: 'Active',
    matches: (todo) => !todo.completed,
    toUpdate: () => ({ completed: false }),
  },
  {
    id: 'completed',
    title: 'Completed',
    matches: (todo) => todo.completed,
    toUpdate: () => ({ completed: true }),
  },
];

const priorityColumns: Column[] = (
  [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT] as Priority[]
).map((priority) => ({
  id: priority,
  title: getPriorityLabel(priority),
  matches: (todo) => todo.priority === priority,
  toUpdate: () => ({ priority }),
}));

function TodoCard({ todo }: { todo: Todo }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', getPriorityColor(todo.priority))} />
        <p
          className={cn(
            'text-sm font-medium text-gray-900 dark:text-gray-100',
            todo.completed && 'line-through text-gray-500 dark:text-gray-400'
          )}
        >
          {todo.title}
        </p>
      </div>
      {todo.category && (
        <div className="mt-2">
          <Badge color={todo.category.color}>{todo.category.name}</Badge>
        </div>
      )}
    </div>
  );
}

function BoardColumn({ column, todos }: { column: Column; todos: Todo[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 flex-shrink-0 flex-col rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/40',
        isOver ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{column.title}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {todos.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {todos.map((todo) => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
        {todos.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400 dark:text-gray-500">No todos</p>
        )}
      </div>
    </div>
  );
}

export function Board() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<BoardMode>('status');
  const { data, isLoading } = useTodos({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' });
  const updateTodo = useUpdateTodo();

  const todos = useMemo(() => data?.data ?? [], [data?.data]);
  const columns = mode === 'status' ? statusColumns : priorityColumns;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const todo = todos.find((t) => t.id === String(active.id));
    const column = columns.find((c) => c.id === String(over.id));
    if (!todo || !column) return;

    // No-op when the card is dropped on the column it already belongs to.
    if (column.matches(todo)) return;

    updateTodo.mutate({ id: todo.id, input: column.toUpdate() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Board</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag todos between columns to update them.
          </p>
        </div>
        <div className="w-44">
          <Select
            aria-label={t('board.groupBy')}
            value={mode}
            onChange={(e) => setMode(e.target.value as BoardMode)}
            options={[
              { value: 'status', label: 'By status' },
              { value: 'priority', label: 'By priority' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                todos={todos.filter((todo) => column.matches(todo))}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
