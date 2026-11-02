import { cn } from '@/lib/utils';
import type { Analytics, CountBucket, TrendPoint } from '@/types';

/**
 * Lightweight, dependency-free analytics visualizations built from CSS/SVG so
 * we avoid a heavy chart library. All colors are dark-mode aware and the
 * layout is responsive.
 */

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-400 dark:bg-gray-500',
  MEDIUM: 'bg-blue-500 dark:bg-blue-400',
  HIGH: 'bg-orange-500 dark:bg-orange-400',
  URGENT: 'bg-red-500 dark:bg-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500 dark:bg-green-400',
  active: 'bg-blue-500 dark:bg-blue-400',
  overdue: 'bg-red-500 dark:bg-red-400',
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Horizontal bars for a set of labelled counts. */
function HorizontalBars({
  buckets,
  colors,
  emptyLabel,
}: {
  buckets: CountBucket[];
  colors?: Record<string, string>;
  emptyLabel: string;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const hasData = buckets.some((b) => b.count > 0);

  if (!hasData) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-2">
      {buckets.map((bucket) => (
        <div key={bucket.key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs capitalize text-gray-600 dark:text-gray-400 truncate">
            {bucket.key.toLowerCase()}
          </span>
          <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className={cn(
                'h-full rounded transition-all',
                colors?.[bucket.key] ?? 'bg-blue-500 dark:bg-blue-400'
              )}
              style={{ width: `${(bucket.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
            {bucket.count}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Vertical mini bar chart of the completion trend over the window. */
function TrendBars({ trend }: { trend: TrendPoint[] }) {
  const max = Math.max(1, ...trend.map((p) => Math.max(p.completed, p.created)));
  const hasData = trend.some((p) => p.completed > 0 || p.created > 0);

  return (
    <div>
      <div
        className="flex items-end gap-0.5 h-32"
        role="img"
        aria-label="Completion trend"
      >
        {trend.map((point) => (
          <div
            key={point.date}
            className="flex-1 flex flex-col justify-end gap-0.5 group relative"
            title={`${point.date}: ${point.completed} completed, ${point.created} created`}
          >
            <div
              className="w-full rounded-t bg-green-500 dark:bg-green-400"
              style={{ height: `${(point.completed / max) * 100}%` }}
            />
            <div
              className="w-full rounded-t bg-blue-400/60 dark:bg-blue-500/60"
              style={{ height: `${(point.created / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500 dark:bg-green-400" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-400/60 dark:bg-blue-500/60" />
          Created
        </span>
        {!hasData && (
          <span className="ml-auto">No activity in this window</span>
        )}
      </div>
    </div>
  );
}

export function AnalyticsCharts({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-4">
      <ChartCard title={`Completion trend (last ${analytics.rangeDays} days)`}>
        <TrendBars trend={analytics.trend} />
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="By priority">
          <HorizontalBars
            buckets={analytics.byPriority}
            colors={PRIORITY_COLORS}
            emptyLabel="No todos yet"
          />
        </ChartCard>
        <ChartCard title="By status">
          <HorizontalBars
            buckets={analytics.byStatus}
            colors={STATUS_COLORS}
            emptyLabel="No todos yet"
          />
        </ChartCard>
      </div>

      <ChartCard title="By category">
        <HorizontalBars
          buckets={analytics.byCategory}
          emptyLabel="No categorized todos yet"
        />
      </ChartCard>
    </div>
  );
}
