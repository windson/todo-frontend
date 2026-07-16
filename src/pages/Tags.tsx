import { useState } from 'react';
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/hooks/useTags';
import { TagList } from '@/components/tags/TagList';
import { TagForm } from '@/components/tags/TagForm';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Tag, CreateTagInput } from '@/types';

export function Tags() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleSubmit = (input: CreateTagInput) => {
    if (editingTag) {
      updateTag.mutate(
        { id: editingTag.id, input },
        { onSuccess: () => { setShowForm(false); setEditingTag(null); } }
      );
    } else {
      createTag.mutate(input, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteTag.mutate(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tags
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Label and filter your todos with tags
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <TagList
        tags={tags || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => setShowForm(true)}
      />

      <TagForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={createTag.isPending || updateTag.isPending}
        tag={editingTag}
      />
    </div>
  );
}
