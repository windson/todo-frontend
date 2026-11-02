import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/api/comments';
import type { CreateCommentInput, UpdateCommentInput } from '@/types';
import toast from 'react-hot-toast';

export function useComments(todoId: string, enabled = true) {
  return useQuery({
    queryKey: ['comments', todoId],
    queryFn: () => getComments(todoId),
    enabled: enabled && Boolean(todoId),
  });
}

export function useCreateComment(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(todoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

export function useUpdateComment(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateCommentInput }) =>
      updateComment(todoId, commentId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Comment updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(todoId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Comment deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}
