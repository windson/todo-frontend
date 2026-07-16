import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, deleteTodo, bulkUpdateTodos } from '@/api/todos';
import type { TodoFilters, CreateTodoInput, UpdateTodoInput, BulkUpdateInput } from '@/types';
import toast from 'react-hot-toast';

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create todo');
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update todo');
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete todo');
    },
  });
}

export function useBulkUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkUpdateInput) => bulkUpdateTodos(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Bulk update completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Bulk update failed');
    },
  });
}
