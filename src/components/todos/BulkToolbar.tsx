import { useState } from 'react';
import { CheckCircle, Circle, Trash2, X, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useBulkUpdate } from '@/hooks/useTodos';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import { Priority, type BulkUpdateInput } from '@/types';
import { useTranslation } from 'react-i18next';

interface BulkToolbarProps {
  selectedIds: string[];
  onClear: () => void;
}

const priorityOptions = [
  { value: Priority.LOW, label: 'Low' },
  { value: Priority.MEDIUM, label: 'Medium' },
  { value: Priority.HIGH, label: 'High' },
  { value: Priority.URGENT, label: 'Urgent' },
];

export function BulkToolbar({ selectedIds, onClear }: BulkToolbarProps) {
  const { t } = useTranslation();
  const bulkUpdate = useBulkUpdate();
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const [tagAction, setTagAction] = useState<'addTags' | 'removeTags'>('addTags');

  const run = (input: BulkUpdateInput) => {
    bulkUpdate.mutate(input, { onSuccess: onClear });
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-900/20">
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
        {selectedIds.length} selected
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => run({ operation: 'complete', ids: selectedIds })}
        >
          <CheckCircle className="h-4 w-4" />
          Complete
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => run({ operation: 'uncomplete', ids: selectedIds })}
        >
          <Circle className="h-4 w-4" />
          Uncomplete
        </Button>

        {/* Re-prioritize */}
        <Select
          aria-label={t('bulk.setPriority')}
          value=""
          placeholder={t('bulk.setPriorityPlaceholder')}
          onChange={(e) => {
            const value = e.target.value;
            if (value) run({ operation: 'setPriority', ids: selectedIds, priority: value as Priority });
          }}
          options={priorityOptions}
          className="h-9 w-40"
        />

        {/* Re-categorize */}
        <Select
          aria-label={t('bulk.setCategory')}
          value=""
          placeholder={t('bulk.setCategoryPlaceholder')}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__clear__') {
              run({ operation: 'setCategory', ids: selectedIds, categoryId: null });
            } else if (value) {
              run({ operation: 'setCategory', ids: selectedIds, categoryId: value });
            }
          }}
          options={[
            { value: '__clear__', label: 'No category' },
            ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
          ]}
          className="h-9 w-40"
        />

        {/* Re-tag: choose add vs remove, then pick a tag to apply */}
        <Select
          aria-label={t('bulk.tagAction')}
          value={tagAction}
          onChange={(e) => setTagAction(e.target.value as 'addTags' | 'removeTags')}
          options={[
            { value: 'addTags', label: 'Add tag' },
            { value: 'removeTags', label: 'Remove tag' },
          ]}
          className="h-9 w-32"
        />
        <Select
          aria-label={t('bulk.applyTag')}
          value=""
          placeholder={t('bulk.selectTagPlaceholder')}
          onChange={(e) => {
            const value = e.target.value;
            if (value) run({ operation: tagAction, ids: selectedIds, tagIds: [value] });
          }}
          options={tags?.map((t) => ({ value: t.id, label: t.name })) || []}
          className="h-9 w-40"
        />

        {/* Clear assignee on the selected todos. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => run({ operation: 'setAssignee', ids: selectedIds, assigneeId: null })}
        >
          <UserMinus className="h-4 w-4" />
          Unassign
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => run({ operation: 'delete', ids: selectedIds })}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <X className="h-4 w-4" />
        Clear selection
      </Button>
    </div>
  );
}
