import { Calendar, Edit2, Trash2, GripVertical } from 'lucide-react';
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import { getDueDateLabel, isOverdue } from '@/lib/dates';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete, dragHandleProps }: TodoItemProps) {
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-white p-4 transition-all',
        'hover:shadow-md dark:bg-gray-800',
        'dark:border-gray-700',
        todo.completed && 'opacity-60'
      )}
    >
      <div
        {...dragHandleProps}
        className="flex items-center cursor-grab pt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', getPriorityColor(todo.priority))} />

      <div className="pt-0.5">
        <Checkbox
          checked={todo.completed}
          onChange={(checked) => onToggle(todo.id, checked)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'text-sm font-medium text-gray-900 dark:text-gray-100',
              todo.completed && 'line-through text-gray-500 dark:text-gray-400'
            )}
          >
            {todo.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(todo)}
              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
              aria-label="Edit todo"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete todo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {todo.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              'text-xs',
              getPriorityColor(todo.priority),
              'text-white'
            )}
          >
            {getPriorityLabel(todo.priority)}
          </Badge>

          {todo.category && (
            <Badge color={todo.category.color}>
              {todo.category.name}
            </Badge>
          )}

          {todo.tags?.map((todoTag) => (
            <Badge key={todoTag.tagId} color={todoTag.tag.color}>
              {todoTag.tag.name}
            </Badge>
          ))}

          {todo.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs',
                overdue
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Calendar className="h-3 w-3" />
              {getDueDateLabel(todo.dueDate)}
              {overdue && ' (overdue)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
