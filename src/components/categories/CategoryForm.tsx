import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Category, CreateCategoryInput } from '@/types';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => void;
  isLoading: boolean;
  category?: Category | null;
}

const defaultColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

export function CategoryForm({ isOpen, onClose, onSubmit, isLoading, category }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || defaultColors[0]);
  const [nameError, setNameError] = useState('');

  const isEdit = Boolean(category);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    onSubmit({ name: name.trim(), color });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Create Category'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isLoading} onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="Category name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError('');
          }}
          error={nameError}
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {defaultColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border-0"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Custom color
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
