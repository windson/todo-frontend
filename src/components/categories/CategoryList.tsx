import { Edit2, Trash2, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { Category } from '@/types';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function CategoryList({ categories, isLoading, onEdit, onDelete, onAdd }: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-12 w-12" />}
        title="No categories yet"
        description="Create categories to organize your todos."
        actionLabel="Add Category"
        onAction={onAdd}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {category.name}
                </h3>
                {category._count && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category._count.todos} {category._count.todos === 1 ? 'todo' : 'todos'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(category)}
                className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                aria-label="Edit category"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Delete category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
