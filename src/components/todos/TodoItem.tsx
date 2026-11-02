import { Calendar, Edit2, Trash2, GripVertical, UserCircle } from 'lucide-react';
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import { getDueDateLabel, isOverdue } from '@/lib/dates';
import { MessageSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Markdown } from '@/components/ui/Markdown';
import { SubtaskList } from './SubtaskList';
import type { Todo } from '@/types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onOpenDetail?: (todo: Todo) => void;
  dragHandleProps?: Record<string, unknown>;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete, onOpenDetail, dragHandleProps, selectable, selected, onSelectChange }: TodoItemProps) {
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-white p-4 transition-all',
        'hover:shadow-md dark:bg-gray-800',
        'dark:border-gray-700',
        selected && 'ring-2 ring-blue-500 border-blue-500',
        todo.completed && 'opacity-60'
      )}
    >
      {selectable && (
        <div className="pt-0.5">
          <Checkbox
            checked={Boolean(selected)}
            onChange={(checked) => onSelectChange?.(todo.id, checked)}
            aria-label={`Select ${todo.title}`}
          />
        </div>
      )}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex items-center cursor-grab pt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

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
            {onOpenDetail && (
              <button
                onClick={() => onOpenDetail(todo)}
                className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                aria-label="Open todo details"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            )}
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
          <Markdown
            content={todo.description}
            className="mt-1 max-h-16 overflow-hidden text-xs text-gray-500 dark:text-gray-400"
          />
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

          {todo.tags?.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
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

          {todo.assignee && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              title={`Assigned to ${todo.assignee.name ?? todo.assignee.email}`}
            >
              <UserCircle className="h-3 w-3" />
              {todo.assignee.name ?? todo.assignee.email}
            </span>
          )}

          {todo.shares && todo.shares.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              title={`Shared with ${todo.shares.length} ${todo.shares.length === 1 ? 'person' : 'people'}`}
            >
              Shared · {todo.shares.length}
            </span>
          )}
        </div>

        {/* Subtasks / checklist with progress indicator. Only shown for
            top-level todos (subtasks themselves have a parentId). */}
        {!todo.parentId && <SubtaskList todo={todo} />}
      </div>
    </div>
  );
}
