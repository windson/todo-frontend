import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedViews, createSavedView, updateSavedView, deleteSavedView } from '@/api/views';
import type { CreateSavedViewInput, UpdateSavedViewInput } from '@/types';
import toast from 'react-hot-toast';

export function useSavedViews() {
  return useQuery({
    queryKey: ['views'],
    queryFn: getSavedViews,
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSavedViewInput) => createSavedView(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['views'] });
      toast.success('View saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save view');
    },
  });
}

export function useUpdateSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSavedViewInput }) =>
      updateSavedView(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['views'] });
      toast.success('View updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update view');
    },
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavedView(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['views'] });
      toast.success('View deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete view');
    },
  });
}
