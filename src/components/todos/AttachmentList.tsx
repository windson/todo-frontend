import { useState } from 'react';
import { Paperclip, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  useAttachments,
  useCreateAttachment,
  useDeleteAttachment,
} from '@/hooks/useAttachments';

interface AttachmentListProps {
  todoId: string;
  /** Hide add/remove controls (e.g. for a todo shared with the user as Viewer). */
  readOnly?: boolean;
}

function formatSize(size: number | null): string {
  if (size == null) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ todoId, readOnly = false }: AttachmentListProps) {
  const { data: attachments, isLoading } = useAttachments(todoId);
  const createAttachment = useCreateAttachment(todoId);
  const deleteAttachment = useDeleteAttachment(todoId);

  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    const name = filename.trim() || trimmedUrl.split('/').pop() || 'attachment';
    createAttachment.mutate(
      { url: trimmedUrl, filename: name },
      {
        onSuccess: () => {
          setUrl('');
          setFilename('');
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Attachments
      </h3>

      {isLoading ? (
        <Spinner />
      ) : attachments && attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{attachment.filename}</span>
                {attachment.size != null && (
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    ({formatSize(attachment.size)})
                  </span>
                )}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
              {!readOnly && (
                <button
                  onClick={() => deleteAttachment.mutate(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Remove attachment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No attachments yet.
        </p>
      )}

      {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            label="Attachment URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/file.pdf"
          />
          <Input
            label="Filename (optional)"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="file.pdf"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              loading={createAttachment.isPending}
              disabled={!url.trim()}
            >
              Add by URL
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
