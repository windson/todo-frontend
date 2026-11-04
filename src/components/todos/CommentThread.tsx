import { useState } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Markdown } from '@/components/ui/Markdown';
import { formatRelative } from '@/lib/dates';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/useComments';
import { useTranslation } from 'react-i18next';

interface CommentThreadProps {
  todoId: string;
  /** Hide compose/edit/delete controls (e.g. for a todo shared as Viewer). */
  readOnly?: boolean;
}

export function CommentThread({ todoId, readOnly = false }: CommentThreadProps) {
  const { t } = useTranslation();
  const { data: comments, isLoading } = useComments(todoId);
  const createComment = useCreateComment(todoId);
  const updateComment = useUpdateComment(todoId);
  const deleteComment = useDeleteComment(todoId);

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    createComment.mutate({ body }, { onSuccess: () => setDraft('') });
  };

  const startEdit = (id: string, body: string) => {
    setEditingId(id);
    setEditDraft(body);
  };

  const saveEdit = (id: string) => {
    const body = editDraft.trim();
    if (!body) return;
    updateComment.mutate(
      { commentId: id, input: { body } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Comments
      </h3>

      {isLoading ? (
        <Spinner />
      ) : comments && comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelative(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && ' (edited)'}
                </span>
                <div className="flex items-center gap-1">
                  {readOnly ? null : editingId === comment.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(comment.id)}
                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        aria-label={t('comments.save')}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={t('comments.cancelEdit')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(comment.id, comment.body)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        aria-label={t('comments.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        aria-label={t('comments.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editingId === comment.id ? (
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              ) : (
                <Markdown content={comment.body} className="text-sm" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
      )}

      {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder={t('comments.placeholder')}
            aria-label={t('comments.addLabel')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              loading={createComment.isPending}
              disabled={!draft.trim()}
            >
              Comment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
