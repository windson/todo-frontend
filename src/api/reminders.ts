import { apiClient } from './client';
import type { Reminder, CreateReminderInput, UpdateReminderInput } from '@/types';

export async function getReminders(todoId: string): Promise<Reminder[]> {
  const response = await apiClient.get<Reminder[]>(`/todos/${todoId}/reminders`);
  return response.data;
}

export async function createReminder(
  todoId: string,
  input: CreateReminderInput
): Promise<Reminder> {
  const response = await apiClient.post<Reminder>(`/todos/${todoId}/reminders`, input);
  return response.data;
}

export async function updateReminder(
  todoId: string,
  reminderId: string,
  input: UpdateReminderInput
): Promise<Reminder> {
  const response = await apiClient.patch<Reminder>(
    `/todos/${todoId}/reminders/${reminderId}`,
    input
  );
  return response.data;
}

export async function deleteReminder(todoId: string, reminderId: string): Promise<void> {
  await apiClient.delete(`/todos/${todoId}/reminders/${reminderId}`);
}
