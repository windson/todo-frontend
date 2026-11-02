import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTodos, useCreateTodo } from '@/hooks/useTodos';
import { TodoForm } from '@/components/todos/TodoForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn, getPriorityColor } from '@/lib/utils';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);

  // Pull a generous page of todos so the whole visible month is covered.
  const { data, isLoading } = useTodos({ limit: 100 });
  const createTodo = useCreateTodo();
  // Stabilise the todos array reference so the grouping memo below only
  // recomputes when the data actually changes.
  const todos = useMemo(() => data?.data ?? [], [data?.data]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  // Group todos that have a due date by their calendar day.
  const todosByDay = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      const key = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(todo);
      } else {
        map.set(key, [todo]);
      }
    }
    return map;
  }, [todos]);

  const handleCreate = (input: CreateTodoInput | UpdateTodoInput) => {
    createTodo.mutate(input as CreateTodoInput, {
      onSuccess: () => setShowForm(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Todos placed on their due dates
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Todo
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {format(cursor, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCursor((c) => subMonths(c, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayTodos = todosByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const today = isToday(day);

              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-24 border-b border-r border-gray-100 p-1.5 dark:border-gray-700/60',
                    !inMonth && 'bg-gray-50 dark:bg-gray-900/40'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        today
                          ? 'bg-blue-600 font-semibold text-white'
                          : inMonth
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-600'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {dayTodos.slice(0, 3).map((todo) => (
                      <li
                        key={todo.id}
                        title={todo.title}
                        className={cn(
                          'flex items-center gap-1 rounded px-1 py-0.5 text-xs',
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
                          todo.completed && 'line-through opacity-60'
                        )}
                      >
                        <span
                          className={cn(
                            'h-2 w-2 flex-shrink-0 rounded-full',
                            getPriorityColor(todo.priority)
                          )}
                        />
                        <span className="truncate">{todo.title}</span>
                      </li>
                    ))}
                    {dayTodos.length > 3 && (
                      <li className="px-1 text-xs text-gray-400 dark:text-gray-500">
                        +{dayTodos.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TodoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        isLoading={createTodo.isPending}
      />
    </div>
  );
}
