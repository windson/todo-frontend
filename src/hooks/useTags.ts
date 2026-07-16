import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags, createTag, updateTag, deleteTag } from '@/api/tags';
import type { CreateTagInput, UpdateTagInput } from '@/types';
import toast from 'react-hot-toast';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) =>
      updateTag(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tag');
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Tag deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });
}
