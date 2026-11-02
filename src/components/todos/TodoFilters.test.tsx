import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));

import { TodoFilters } from '@/components/todos/TodoFilters';
import type { TodoFilters as TodoFiltersType } from '@/types';

describe('TodoFilters smart due-date list', () => {
  it('renders a Due smart-list select with the three options', () => {
    render(<TodoFilters filters={{}} onFilterChange={vi.fn()} />);

    const select = screen.getByLabelText('Due');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Overdue' })).toBeInTheDocument();
  });

  it('propagates the chosen dueFilter upward', () => {
    const onFilterChange = vi.fn();
    render(<TodoFilters filters={{}} onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText('Due'), { target: { value: 'overdue' } });

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ dueFilter: 'overdue' })
    );
  });

  it('reflects an active dueFilter from props', () => {
    const filters: TodoFiltersType = { dueFilter: 'today' };
    render(<TodoFilters filters={filters} onFilterChange={vi.fn()} />);

    expect(screen.getByLabelText('Due')).toHaveValue('today');
    // An active smart filter surfaces the Clear control.
    expect(screen.getByRole('button', { name: /Clear/ })).toBeInTheDocument();
  });

  it('clears the dueFilter when Clear is pressed', () => {
    const onFilterChange = vi.fn();
    const filters: TodoFiltersType = { dueFilter: 'upcoming', search: 'x' };
    render(<TodoFilters filters={filters} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));

    const arg = onFilterChange.mock.calls[0][0] as TodoFiltersType;
    expect(arg.dueFilter).toBeUndefined();
    // Non-due filters like search are preserved by Clear.
    expect(arg.search).toBe('x');
  });
});
