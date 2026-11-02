import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TodoItem } from './TodoItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ListTodo } from 'lucide-react';
import type { Todo } from '@/types';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onOpenDetail?: (todo: Todo) => void;
  onAddTodo?: () => void;
}

function SortableTodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onOpenDetail,
}: {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onOpenDetail?: (todo: Todo) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenDetail={onOpenDetail}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function TodoList({
  todos,
  isLoading,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
  onOpenDetail,
  onAddTodo,
}: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="h-12 w-12" />}
        title="No todos found"
        description="Create your first todo to get started or adjust your filters."
        actionLabel={onAddTodo ? 'Add Todo' : undefined}
        onAction={onAddTodo}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
