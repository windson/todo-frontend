import { useTodos } from '@/hooks/useTodos';
import { useAnalytics } from '@/hooks/useData';
import { TodoStats } from '@/components/todos/TodoStats';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { ImportExport } from '@/components/analytics/ImportExport';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Analytics dashboard: productivity breakdowns and completion trends over the
 * user's owned todos, plus data backup (export) and restore (import) controls.
 */
export function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();
  // Reuse the existing TodoStats summary alongside the trend charts.
  const { data: todosData } = useTodos({ limit: 100 });
  const todos = todosData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Insights into your productivity, plus backup and restore
        </p>
      </div>

      <TodoStats todos={todos} />

      {isLoading ? (
        <div className="py-12">
          <Spinner size="lg" />
        </div>
      ) : analytics ? (
        <AnalyticsCharts analytics={analytics} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Analytics are unavailable right now.
        </p>
      )}

      <ImportExport />
    </div>
  );
}
