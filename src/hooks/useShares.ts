import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShares,
  createShare,
  updateShare,
  deleteShare,
} from '@/api/shares';
import type { CreateShareInput, UpdateShareInput } from '@/types';
import toast from 'react-hot-toast';

export function useShares(todoId: string, enabled = true) {
  return useQuery({
    queryKey: ['shares', todoId],
    queryFn: () => getShares(todoId),
    enabled: enabled && Boolean(todoId),
  });
}

function invalidateTodoViews(
  queryClient: ReturnType<typeof useQueryClient>,
  todoId: string
) {
  void queryClient.invalidateQueries({ queryKey: ['shares', todoId] });
  void queryClient.invalidateQueries({ queryKey: ['todos'] });
  void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
}

export function useCreateShare(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShareInput) => createShare(todoId, input),
    onSuccess: () => {
      invalidateTodoViews(queryClient, todoId);
      toast.success('Todo shared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share todo');
    },
  });
}

export function useUpdateShare(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateShareInput }) =>
      updateShare(todoId, userId, input),
    onSuccess: () => {
      invalidateTodoViews(queryClient, todoId);
      toast.success('Role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

export function useDeleteShare(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteShare(todoId, userId),
    onSuccess: () => {
      invalidateTodoViews(queryClient, todoId);
      toast.success('Access removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove access');
    },
  });
}
