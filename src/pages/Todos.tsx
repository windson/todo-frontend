import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import { TodoList } from '@/components/todos/TodoList';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoFilters } from '@/components/todos/TodoFilters';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Todo, TodoFilters as TodoFiltersType, CreateTodoInput, UpdateTodoInput } from '@/types';

export function Todos() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || undefined;
  const dueFilterParam = searchParams.get('dueFilter') as
    | TodoFiltersType['dueFilter']
    | null;

  const [filters, setFilters] = useState<TodoFiltersType>({
    search: searchQuery,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 50,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const currentFilters = {
    ...filters,
    search: searchQuery || filters.search,
    dueFilter: dueFilterParam ?? filters.dueFilter,
  };
  const { data, isLoading } = useTodos(currentFilters);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const todos = data?.data || [];

  const handleToggle = useCallback(
    (id: string, completed: boolean) => {
      updateTodo.mutate({ id, input: { completed } });
    },
    [updateTodo]
  );

  const handleEdit = useCallback((todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteTodo.mutate(id);
    },
    [deleteTodo]
  );

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const activeTodo = todos.find((t) => t.id === activeId);
      const overTodo = todos.find((t) => t.id === overId);
      if (activeTodo && overTodo) {
        updateTodo.mutate({ id: activeId, input: { order: overTodo.order } });
        updateTodo.mutate({ id: overId, input: { order: activeTodo.order } });
      }
    },
    [todos, updateTodo]
  );

  const handleSubmit = (input: CreateTodoInput | UpdateTodoInput) => {
    if (editingTodo) {
      updateTodo.mutate(
        { id: editingTodo.id, input: input as UpdateTodoInput },
        { onSuccess: () => { setShowForm(false); setEditingTodo(null); } }
      );
    } else {
      createTodo.mutate(input as CreateTodoInput, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Todos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data?.total || 0} total tasks
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Todo
        </Button>
      </div>

      <TodoFilters filters={currentFilters} onFilterChange={setFilters} />

      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onAddTodo={() => setShowForm(true)}
      />

      <TodoForm
        key={editingTodo?.id ?? 'new'}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={createTodo.isPending || updateTodo.isPending}
        todo={editingTodo}
      />
    </div>
  );
}
