import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { Priority, type Todo, type CreateTodoInput, type UpdateTodoInput } from '@/types';
import { toInputDateFormat } from '@/lib/dates';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTodoInput | UpdateTodoInput) => void;
  isLoading: boolean;
  todo?: Todo | null;
}

export function TodoForm({ isOpen, onClose, onSubmit, isLoading, todo }: TodoFormProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [priority, setPriority] = useState<Priority>(todo?.priority || Priority.MEDIUM);
  const [categoryId, setCategoryId] = useState(todo?.categoryId || '');
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? toInputDateFormat(todo.dueDate) : ''
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    todo?.tags?.map((t) => t.id) || []
  );
  const [titleError, setTitleError] = useState('');

  const isEdit = Boolean(todo);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    if (isEdit) {
      const input: UpdateTodoInput = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        categoryId: categoryId || null,
        dueDate: dueDate || null,
      };
      onSubmit(input);
    } else {
      const input: CreateTodoInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId: categoryId || undefined,
        dueDate: dueDate || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      };
      onSubmit(input);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Todo' : 'Create Todo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError('');
          }}
          error={titleError}
          autoFocus
        />

        <div className="w-full">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Add details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={[
              { value: Priority.LOW, label: 'Low' },
              { value: Priority.MEDIUM, label: 'Medium' },
              { value: Priority.HIGH, label: 'High' },
              { value: Priority.URGENT, label: 'Urgent' },
            ]}
          />

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="None"
            options={
              categories?.map((c) => ({ value: c.id, label: c.name })) || []
            }
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {tags && tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                    selectedTagIds.includes(tag.id)
                      ? 'ring-2 ring-offset-1 ring-blue-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
