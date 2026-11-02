import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { arrayMove } from '@dnd-kit/sortable';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useBulkUpdate } from '@/hooks/useTodos';
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
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || undefined;
  const newParam = searchParams.get('new');
  const dueFilterParam = searchParams.get('dueFilter') as
    | TodoFiltersType['dueFilter']
    | null;

  const [filters, setFilters] = useState<TodoFiltersType>({
    search: searchQuery,
    sortBy: 'order',
    sortOrder: 'asc',
    dueFilter: dueFilterParam ?? undefined,
    limit: 50,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Open the new-todo form when the command palette navigates here with ?new=1.
  useEffect(() => {
    if (newParam) {
      setShowForm(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('new');
          return next;
        },
        { replace: true }
      );
    }
  }, [newParam, setSearchParams]);

  const handleFilterChange = useCallback(
    (nextFilters: TodoFiltersType) => {
      setFilters(nextFilters);
      if (dueFilterParam) {
        setSearchParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            next.delete('dueFilter');
            return next;
          },
          { replace: true }
        );
      }
    },
    [dueFilterParam, setSearchParams]
  );

  const currentFilters = {
    ...filters,
    search: searchQuery || filters.search,
    dueFilter: dueFilterParam ?? filters.dueFilter,
  };
  const { data, isLoading } = useTodos(currentFilters);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const bulkUpdate = useBulkUpdate();

  const todos = useMemo(() => data?.data ?? [], [data?.data]);
  const reorderEnabled =
    currentFilters.sharedWithMe === false &&
    !currentFilters.search &&
    currentFilters.completed === undefined &&
    currentFilters.priority === undefined &&
    currentFilters.categoryId === undefined &&
    currentFilters.tagId === undefined &&
    currentFilters.assigneeId === undefined &&
    currentFilters.dueBefore === undefined &&
    currentFilters.dueAfter === undefined &&
    currentFilters.dueFilter === undefined &&
    (data?.total ?? 0) === todos.length;

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
      const activeIndex = todos.findIndex((todo) => todo.id === activeId);
      const overIndex = todos.findIndex((todo) => todo.id === overId);
      if (activeIndex === -1 || overIndex === -1) return;

      const reordered = arrayMove(todos, activeIndex, overIndex);
      bulkUpdate.mutate({
        operation: 'reorder',
        ids: reordered.map((todo) => todo.id),
      });
    },
    [bulkUpdate, todos]
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
            {t('todos.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('todos.totalTasks', { count: data?.total || 0 })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectMode ? 'secondary' : 'ghost'}
            onClick={toggleSelectMode}
          >
            <CheckSquare className="h-4 w-4" />
            {selectMode ? t('todos.done') : t('todos.select')}
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {t('todos.addTodo')}
          </Button>
        </div>
      </div>

      <SavedViews filters={currentFilters} onApply={handleFilterChange} />

      <TodoFilters filters={currentFilters} onFilterChange={handleFilterChange} />

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
        reorderEnabled={reorderEnabled}
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
