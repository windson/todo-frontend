import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos';
import { TodoList } from '@/components/todos/TodoList';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoFilters } from '@/components/todos/TodoFilters';
import { TodoDetailModal } from '@/components/todos/TodoDetailModal';
import { SavedViews } from '@/components/todos/SavedViews';
import { BulkToolbar } from '@/components/todos/BulkToolbar';
import { Button } from '@/components/ui/Button';
import { Plus, CheckSquare } from 'lucide-react';
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
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleOpenDetail = useCallback((todo: Todo) => {
    setDetailTodo(todo);
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

  const handleSelectChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((existing) => existing !== id)
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

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
        <div className="flex items-center gap-2">
          <Button
            variant={selectMode ? 'secondary' : 'ghost'}
            onClick={toggleSelectMode}
          >
            <CheckSquare className="h-4 w-4" />
            {selectMode ? 'Done' : 'Select'}
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Todo
          </Button>
        </div>
      </div>

      <SavedViews filters={currentFilters} onApply={setFilters} />

      <TodoFilters filters={currentFilters} onFilterChange={setFilters} />

      {selectMode && (
        <BulkToolbar selectedIds={selectedIds} onClear={clearSelection} />
      )}

      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onOpenDetail={handleOpenDetail}
        onAddTodo={() => setShowForm(true)}
        selectable={selectMode}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
      />

      <TodoForm
        key={editingTodo?.id ?? 'new'}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={createTodo.isPending || updateTodo.isPending}
        todo={editingTodo}
      />

      <TodoDetailModal
        isOpen={detailTodo !== null}
        onClose={() => setDetailTodo(null)}
        todo={detailTodo ? todos.find((t) => t.id === detailTodo.id) ?? detailTodo : null}
      />
    </div>
  );
}
