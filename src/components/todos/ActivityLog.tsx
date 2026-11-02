import {
  CheckCircle2,
  Circle,
  FilePlus,
  FileMinus,
  MessageSquarePlus,
  MessageSquare,
  Pencil,
  Plus,
  Activity as ActivityIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelative } from '@/lib/dates';
import { useActivity } from '@/hooks/useActivity';
import type { ActivityLogEntry } from '@/types';

interface ActivityLogProps {
  todoId: string;
}

const ACTION_LABELS: Record<string, string> = {
  'todo.created': 'created this todo',
  'todo.updated': 'updated this todo',
  'todo.completed': 'completed this todo',
  'todo.uncompleted': 'reopened this todo',
  'todo.deleted': 'deleted this todo',
  'comment.created': 'added a comment',
  'comment.updated': 'edited a comment',
  'comment.deleted': 'deleted a comment',
  'attachment.added': 'added an attachment',
  'attachment.removed': 'removed an attachment',
};

function actionIcon(action: string): ReactNode {
  switch (action) {
    case 'todo.created':
      return <Plus className="h-4 w-4" />;
    case 'todo.updated':
      return <Pencil className="h-4 w-4" />;
    case 'todo.completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'todo.uncompleted':
      return <Circle className="h-4 w-4" />;
    case 'comment.created':
      return <MessageSquarePlus className="h-4 w-4" />;
    case 'comment.updated':
    case 'comment.deleted':
      return <MessageSquare className="h-4 w-4" />;
    case 'attachment.added':
      return <FilePlus className="h-4 w-4" />;
    case 'attachment.removed':
      return <FileMinus className="h-4 w-4" />;
    default:
      return <ActivityIcon className="h-4 w-4" />;
  }
}

function describe(entry: ActivityLogEntry): string {
  return ACTION_LABELS[entry.action] ?? entry.action;
}

export function ActivityLog({ todoId }: ActivityLogProps) {
  const { data: activity, isLoading } = useActivity(todoId);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Activity
      </h3>

      {isLoading ? (
        <Spinner />
      ) : activity && activity.length > 0 ? (
        <ul className="space-y-3">
          {activity.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-gray-400 dark:text-gray-500">
                {actionIcon(entry.action)}
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {describe(entry)}
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  {formatRelative(entry.createdAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet.</p>
      )}
    </div>
  );
}
