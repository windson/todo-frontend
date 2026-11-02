import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttachments,
  createAttachment,
  deleteAttachment,
} from '@/api/attachments';
import type { CreateAttachmentInput } from '@/types';
import toast from 'react-hot-toast';

export function useAttachments(todoId: string, enabled = true) {
  return useQuery({
    queryKey: ['attachments', todoId],
    queryFn: () => getAttachments(todoId),
    enabled: enabled && Boolean(todoId),
  });
}

export function useCreateAttachment(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAttachmentInput) => createAttachment(todoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attachments', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Attachment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add attachment');
    },
  });
}

export function useDeleteAttachment(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(todoId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attachments', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Attachment removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove attachment');
    },
  });
}
