import { X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { Priority, type TodoFilters as TodoFiltersType } from '@/types';

interface TodoFiltersProps {
  filters: TodoFiltersType;
  onFilterChange: (filters: TodoFiltersType) => void;
}

export function TodoFilters({ filters, onFilterChange }: TodoFiltersProps) {
  const { data: categories } = useCategories();

  const hasActiveFilters =
    filters.completed !== undefined ||
    filters.priority !== undefined ||
    filters.categoryId !== undefined ||
    filters.dueBefore !== undefined ||
    filters.dueAfter !== undefined ||
    filters.dueFilter !== undefined;

  const handleClear = () => {
    onFilterChange({
      search: filters.search,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <Select
        label="Status"
        value={filters.completed === undefined ? '' : String(filters.completed)}
        onChange={(e) => {
          const val = e.target.value;
          onFilterChange({
            ...filters,
            completed: val === '' ? undefined : val === 'true',
          });
        }}
        placeholder="All"
        options={[
          { value: 'false', label: 'Active' },
          { value: 'true', label: 'Completed' },
        ]}
      />

      <Select
        label="Priority"
        value={(filters.priority as string) || ''}
        onChange={(e) => {
          const val = e.target.value;
          onFilterChange({
            ...filters,
            priority: val ? (val as Priority) : undefined,
          });
        }}
        placeholder="All"
        options={[
          { value: Priority.LOW, label: 'Low' },
          { value: Priority.MEDIUM, label: 'Medium' },
          { value: Priority.HIGH, label: 'High' },
          { value: Priority.URGENT, label: 'Urgent' },
        ]}
      />

      <Select
        label="Category"
        value={filters.categoryId || ''}
        onChange={(e) => {
          onFilterChange({
            ...filters,
            categoryId: e.target.value || undefined,
          });
        }}
        placeholder="All"
        options={
          categories?.map((c) => ({ value: c.id, label: c.name })) || []
        }
      />

      <Select
        label="Due"
        value={filters.dueFilter || ''}
        onChange={(e) => {
          const val = e.target.value as TodoFiltersType['dueFilter'] | '';
          onFilterChange({
            ...filters,
            dueFilter: val || undefined,
          });
        }}
        placeholder="Any time"
        options={[
          { value: 'today', label: 'Today' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'overdue', label: 'Overdue' },
        ]}
      />

      <Input
        label="Due After"
        type="date"
        value={filters.dueAfter || ''}
        onChange={(e) => {
          onFilterChange({
            ...filters,
            dueAfter: e.target.value || undefined,
          });
        }}
      />

      <Input
        label="Due Before"
        type="date"
        value={filters.dueBefore || ''}
        onChange={(e) => {
          onFilterChange({
            ...filters,
            dueBefore: e.target.value || undefined,
          });
        }}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
