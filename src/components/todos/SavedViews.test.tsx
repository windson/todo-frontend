import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const getSavedViewsMock = vi.fn();
const createSavedViewMock = vi.fn();
const deleteSavedViewMock = vi.fn();

vi.mock('@/api/views', () => ({
  getSavedViews: () => getSavedViewsMock(),
  createSavedView: (...args: unknown[]) => createSavedViewMock(...args),
  deleteSavedView: (...args: unknown[]) => deleteSavedViewMock(...args),
  updateSavedView: vi.fn(),
  getSavedView: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { SavedViews } from '@/components/todos/SavedViews';
import type { SavedView, TodoFilters } from '@/types';

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const sampleView: SavedView = {
  id: 'view-1',
  name: 'High priority',
  filters: { priority: 'HIGH,URGENT', completed: 'false' },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('SavedViews', () => {
  beforeEach(() => {
    getSavedViewsMock.mockReset();
    createSavedViewMock.mockReset();
    deleteSavedViewMock.mockReset();
    getSavedViewsMock.mockResolvedValue([sampleView]);
    createSavedViewMock.mockResolvedValue(sampleView);
    deleteSavedViewMock.mockResolvedValue(undefined);
  });

  it('saves the current filters as a named view', async () => {
    const currentFilters: TodoFilters = {
      priority: ['HIGH', 'URGENT'],
      completed: false,
    };

    renderWithClient(<SavedViews filters={currentFilters} onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Save current/ }));
    fireEvent.change(screen.getByLabelText('View name'), {
      target: { value: 'My view' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(createSavedViewMock).toHaveBeenCalledWith({
        name: 'My view',
        filters: { priority: 'HIGH,URGENT', completed: 'false' },
      })
    );
  });

  it('applies a saved view by converting stored filters back to TodoFilters', async () => {
    const onApply = vi.fn();
    renderWithClient(<SavedViews filters={{}} onApply={onApply} />);

    // Wait for the fetched view chip to appear, then click it.
    const chip = await screen.findByRole('button', { name: 'High priority' });
    fireEvent.click(chip);

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: ['HIGH', 'URGENT'],
        completed: false,
      })
    );
  });

  it('deletes a saved view', async () => {
    renderWithClient(<SavedViews filters={{}} onApply={vi.fn()} />);

    const deleteBtn = await screen.findByRole('button', { name: /Delete view High priority/ });
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(deleteSavedViewMock).toHaveBeenCalledWith('view-1'));
  });
});
