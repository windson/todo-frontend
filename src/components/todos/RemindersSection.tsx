import { useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  useReminders,
  useCreateReminder,
  useDeleteReminder,
} from '@/hooks/useReminders';
import { ReminderChannel } from '@/types';
import { formatDateTime } from '@/lib/dates';

interface RemindersSectionProps {
  todoId: string;
}

const CHANNEL_LABELS: Record<ReminderChannel, string> = {
  INAPP: 'In-app',
  EMAIL: 'Email',
  PUSH: 'Push',
};

export function RemindersSection({ todoId }: RemindersSectionProps) {
  const { data: reminders, isLoading } = useReminders(todoId);
  const createMutation = useCreateReminder(todoId);
  const deleteMutation = useDeleteReminder(todoId);

  const [remindAt, setRemindAt] = useState('');
  const [channel, setChannel] = useState<ReminderChannel>(ReminderChannel.INAPP);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!remindAt) {
      setError('Pick a date and time');
      return;
    }
    createMutation.mutate(
      { remindAt: new Date(remindAt).toISOString(), channel },
      {
        onSuccess: () => {
          setRemindAt('');
          setChannel(ReminderChannel.INAPP);
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Bell className="h-4 w-4" />
        Reminders
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading reminders...</p>
      ) : reminders && reminders.length > 0 ? (
        <ul className="space-y-2">
          {reminders.map((reminder) => (
            <li
              key={reminder.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
            >
              <div className="min-w-0">
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDateTime(reminder.remindAt)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {CHANNEL_LABELS[reminder.channel]}
                  {reminder.sentAt ? ' · sent' : ' · pending'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(reminder.id)}
                disabled={deleteMutation.isPending}
                className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 disabled:opacity-50"
                aria-label="Delete reminder"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No reminders yet.</p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Input
          label="Remind at"
          type="datetime-local"
          value={remindAt}
          onChange={(e) => {
            setRemindAt(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          error={error}
        />
        <Select
          label="Channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value as ReminderChannel)}
          options={[
            { value: ReminderChannel.INAPP, label: 'In-app' },
            { value: ReminderChannel.EMAIL, label: 'Email' },
            { value: ReminderChannel.PUSH, label: 'Push' },
          ]}
        />
        <Button
          type="button"
          variant="secondary"
          loading={createMutation.isPending}
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
