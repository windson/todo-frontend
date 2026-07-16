import { Edit2, Trash2, TagsIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { Tag } from '@/types';

interface TagListProps {
  tags: Tag[];
  isLoading: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function TagList({ tags, isLoading, onEdit, onDelete, onAdd }: TagListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <EmptyState
        icon={<TagsIcon className="h-12 w-12" />}
        title="No tags yet"
        description="Create tags to label and filter your todos."
        actionLabel="Add Tag"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <span
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: tag.color }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {tag.name}
          </span>
          {tag._count && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({tag._count.todos})
            </span>
          )}
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(tag)}
              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
              aria-label="Edit tag"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(tag.id)}
              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete tag"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
