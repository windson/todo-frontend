import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Category, CreateCategoryInput } from '@/types';

export function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSubmit = (input: CreateCategoryInput) => {
    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, input },
        { onSuccess: () => { setShowForm(false); setEditingCategory(null); } }
      );
    } else {
      createCategory.mutate(input, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your todos into categories
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoryList
        categories={categories || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => setShowForm(true)}
      />

      <CategoryForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={createCategory.isPending || updateCategory.isPending}
        category={editingCategory}
      />
    </div>
  );
}
