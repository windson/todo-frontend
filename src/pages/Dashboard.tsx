import { useState } from 'react';
import { useTodos, useCreateTodo } from '@/hooks/useTodos';
import { TodoStats } from '@/components/todos/TodoStats';
import { TodoForm } from '@/components/todos/TodoForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn, getPriorityColor, getPriorityLabel } from '@/lib/utils';
import { formatRelative } from '@/lib/dates';
import { Plus } from 'lucide-react';
import type { CreateTodoInput, UpdateTodoInput } from '@/types';

export function Dashboard() {
  const { data, isLoading } = useTodos({ limit: 100 });
  const createTodo = useCreateTodo();
  const [showForm, setShowForm] = useState(false);

  const todos = data?.data || [];
  const recentTodos = [...todos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleCreate = (input: CreateTodoInput | UpdateTodoInput) => {
    createTodo.mutate(input as CreateTodoInput, {
      onSuccess: () => setShowForm(false),
    });
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your tasks and progress
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>
      </div>

      <TodoStats todos={todos} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Todos
        </h2>
        {recentTodos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No todos yet. Create your first one!
          </p>
        ) : (
          <div className="space-y-2">
            {recentTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div
                  className={cn(
                    'w-1 h-8 rounded-full',
                    getPriorityColor(todo.priority)
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium text-gray-900 dark:text-gray-100 truncate',
                      todo.completed && 'line-through text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {todo.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getPriorityLabel(todo.priority)} - {formatRelative(todo.createdAt)}
                  </p>
                </div>
                <div
                  className={cn(
                    'h-2 w-2 rounded-full flex-shrink-0',
                    todo.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <TodoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        isLoading={createTodo.isPending}
      />
    </div>
  );
}
