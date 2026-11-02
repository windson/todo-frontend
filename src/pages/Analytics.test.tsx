import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Analytics as AnalyticsData } from '@/types';

const getAnalyticsMock = vi.fn();
const exportDataMock = vi.fn();
const importDataMock = vi.fn();
const downloadBlobMock = vi.fn();
vi.mock('@/api/data', () => ({
  getAnalytics: (...args: unknown[]) => getAnalyticsMock(...args),
  exportData: (...args: unknown[]) => exportDataMock(...args),
  importData: (...args: unknown[]) => importDataMock(...args),
  downloadBlob: (...args: unknown[]) => downloadBlobMock(...args),
}));

vi.mock('@/api/todos', () => ({
  getTodos: vi.fn().mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 }),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  bulkUpdateTodos: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { Analytics } from '@/pages/Analytics';

function makeAnalytics(overrides: Partial<AnalyticsData> = {}): AnalyticsData {
  return {
    rangeDays: 30,
    rangeStart: '2024-01-01T00:00:00.000Z',
    totals: { total: 10, completed: 4, active: 6, overdue: 2, completionRate: 0.4 },
    byPriority: [
      { key: 'LOW', count: 7 },
      { key: 'MEDIUM', count: 0 },
      { key: 'HIGH', count: 3 },
      { key: 'URGENT', count: 0 },
    ],
    byStatus: [
      { key: 'completed', count: 4 },
      { key: 'active', count: 6 },
      { key: 'overdue', count: 2 },
    ],
    byCategory: [{ key: 'cat-1', count: 6 }],
    trend: Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      completed: i === 29 ? 2 : 0,
      created: i === 29 ? 1 : 0,
    })),
    ...overrides,
  };
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  getAnalyticsMock.mockReset();
  exportDataMock.mockReset();
  importDataMock.mockReset();
  downloadBlobMock.mockReset();
});

describe('Analytics page', () => {
  it('renders analytics breakdowns and the trend window', async () => {
    getAnalyticsMock.mockResolvedValue(makeAnalytics());

    renderWithClient(<Analytics />);

    await waitFor(() => {
      expect(
        screen.getByText('Completion trend (last 30 days)')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('By priority')).toBeInTheDocument();
    expect(screen.getByText('By status')).toBeInTheDocument();
    expect(screen.getByText('By category')).toBeInTheDocument();
  });

  it('triggers a JSON export when the export button is clicked', async () => {
    getAnalyticsMock.mockResolvedValue(makeAnalytics());
    const blob = new Blob(['{}'], { type: 'application/json' });
    exportDataMock.mockResolvedValue(blob);

    renderWithClient(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Backup & restore')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Export JSON/i }));

    await waitFor(() => {
      expect(exportDataMock).toHaveBeenCalledWith('json');
      expect(downloadBlobMock).toHaveBeenCalledTimes(1);
    });
    // The downloaded filename ends with the json extension.
    const [, filename] = downloadBlobMock.mock.calls[0];
    expect(String(filename)).toMatch(/\.json$/);
  });
});
