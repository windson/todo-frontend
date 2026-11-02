import { Modal } from '@/components/ui/Modal';
import { Markdown } from '@/components/ui/Markdown';
import { CommentThread } from './CommentThread';
import { ActivityLog } from './ActivityLog';
import { AttachmentList } from './AttachmentList';
import type { Todo } from '@/types';

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A rich detail view for a single todo: its markdown description plus the
 * comment thread, attachment references, and the activity log.
 */
export function TodoDetailModal({ todo, isOpen, onClose }: TodoDetailModalProps) {
  if (!todo) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={todo.title}
      className="max-w-2xl"
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h3>
          {todo.description ? (
            <Markdown content={todo.description} className="text-sm" />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No description.
            </p>
          )}
        </section>

        <AttachmentList todoId={todo.id} />
        <CommentThread todoId={todo.id} />
        <ActivityLog todoId={todo.id} />
      </div>
    </Modal>
  );
}
