import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import type { Todo } from '@/types';

interface SubtaskListProps {
  todo: Todo;
}

export function SubtaskList({ todo }: SubtaskListProps) {
  const subtasks = todo.children ?? [];
  const total = todo.progress?.total ?? subtasks.length;
  const completed =
    todo.progress?.completed ?? subtasks.filter((s) => s.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    createTodo.mutate(
      { title, parentId: todo.id },
      {
        onSuccess: () => {
          setNewTitle('');
          setAdding(false);
          setExpanded(true);
        },
      }
    );
  };

  const hasSubtasks = total > 0;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        {hasSubtasks && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <span>
              Subtasks {completed}/{total}
            </span>
          </button>
        )}

        {hasSubtasks && (
          <div className="flex-1 max-w-[120px]">
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all"
                style={{ width: `${percent}%` }}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Subtask progress"
              />
            </div>
          </div>
        )}

        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setExpanded(true);
            }}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add subtask
          </button>
        )}
      </div>

      {expanded && hasSubtasks && (
        <ul className="mt-2 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="group/sub flex items-center gap-2">
              <Checkbox
                checked={subtask.completed}
                onChange={(checked) =>
                  updateTodo.mutate({
                    id: subtask.id,
                    input: { completed: checked },
                  })
                }
                className="h-4 w-4"
              />
              <span
                className={cn(
                  'flex-1 text-xs text-gray-700 dark:text-gray-300',
                  subtask.completed &&
                    'line-through text-gray-400 dark:text-gray-500'
                )}
              >
                {subtask.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo.mutate(subtask.id)}
                className="p-0.5 rounded text-gray-400 opacity-0 group-hover/sub:opacity-100 hover:text-red-600 dark:hover:text-red-400 transition-all"
                aria-label="Delete subtask"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-2 flex items-center gap-2 pl-3">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setAdding(false);
                setNewTitle('');
              }
            }}
            placeholder="New subtask"
            aria-label="New subtask title"
            className={cn(
              'flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs transition-colors',
              'placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
            )}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTitle.trim() || createTodo.isPending}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setNewTitle('');
            }}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Cancel adding subtask"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
