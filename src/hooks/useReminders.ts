import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '@/api/reminders';
import type { CreateReminderInput, UpdateReminderInput } from '@/types';
import toast from 'react-hot-toast';

export function useReminders(todoId: string, enabled = true) {
  return useQuery({
    queryKey: ['reminders', todoId],
    queryFn: () => getReminders(todoId),
    enabled: enabled && Boolean(todoId),
  });
}

export function useCreateReminder(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(todoId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Reminder scheduled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule reminder');
    },
  });
}

export function useUpdateReminder(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, input }: { reminderId: string; input: UpdateReminderInput }) =>
      updateReminder(todoId, reminderId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', todoId] });
      toast.success('Reminder updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reminder');
    },
  });
}

export function useDeleteReminder(todoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteReminder(todoId, reminderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders', todoId] });
      void queryClient.invalidateQueries({ queryKey: ['activity', todoId] });
      toast.success('Reminder deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete reminder');
    },
  });
}
