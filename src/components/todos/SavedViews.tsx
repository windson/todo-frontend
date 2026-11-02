import { useState } from 'react';
import { Bookmark, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useSavedViews,
  useCreateSavedView,
  useDeleteSavedView,
} from '@/hooks/useSavedViews';
import { toSavedViewFilters, fromSavedViewFilters } from '@/lib/savedViews';
import type { TodoFilters } from '@/types';

interface SavedViewsProps {
  filters: TodoFilters;
  onApply: (filters: TodoFilters) => void;
}

export function SavedViews({ filters, onApply }: SavedViewsProps) {
  const { data: views } = useSavedViews();
  const createView = useCreateSavedView();
  const deleteView = useDeleteSavedView();

  const [isNaming, setIsNaming] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createView.mutate(
      { name: trimmed, filters: toSavedViewFilters(filters) },
      {
        onSuccess: () => {
          setName('');
          setIsNaming(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Bookmark className="h-4 w-4" />
        Saved views
      </span>

      {views?.map((view) => (
        <span
          key={view.id}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 pl-3 pr-1 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
        >
          <button
            type="button"
            onClick={() => onApply(fromSavedViewFilters(view.filters))}
            className="font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
          >
            {view.name}
          </button>
          <button
            type="button"
            aria-label={`Delete view ${view.name}`}
            onClick={() => deleteView.mutate(view.id)}
            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {isNaming ? (
        <div className="flex items-center gap-1">
          <Input
            aria-label="View name"
            placeholder="View name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            className="h-8 w-40"
            autoFocus
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={createView.isPending}
            disabled={!name.trim()}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsNaming(false);
              setName('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setIsNaming(true)}>
          <Plus className="h-4 w-4" />
          Save current
        </Button>
      )}
    </div>
  );
}
