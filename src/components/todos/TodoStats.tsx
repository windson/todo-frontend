import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/dates';
import { Priority, type Todo } from '@/types';

interface TodoStatsProps {
  todos: Todo[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueCount = todos.filter(
    (t) => !t.completed && t.dueDate && isOverdue(t.dueDate)
  ).length;
  const urgentCount = todos.filter(
    (t) => !t.completed && t.priority === Priority.URGENT
  ).length;

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Completed',
      value: `${completed} (${completedPercent}%)`,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      icon: Clock,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Urgent',
      value: urgentCount,
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
