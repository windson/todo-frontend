import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import {
  useShares,
  useCreateShare,
  useUpdateShare,
  useDeleteShare,
} from '@/hooks/useShares';
import { useUpdateTodo } from '@/hooks/useTodos';
import { useAuth } from '@/hooks/useAuth';
import { ShareRole, type Todo } from '@/types';
import { useTranslation } from 'react-i18next';

interface SharePanelProps {
  todo: Todo;
  /** Whether the current user owns the todo (only owners may manage shares). */
  canManage: boolean;
}

/**
 * Sharing & assignee controls for a single todo. The owner can invite users by
 * exact email, pick a role, change roles, unshare, and assign the todo to the
 * owner or any shared user. Reuses the existing ui primitives.
 */
export function SharePanel({ todo, canManage }: SharePanelProps) {
  const { t } = useTranslation();
  const { data: shares, isLoading } = useShares(todo.id);
  const createShare = useCreateShare(todo.id);
  const updateShare = useUpdateShare(todo.id);
  const deleteShare = useDeleteShare(todo.id);
  const updateTodo = useUpdateTodo();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ShareRole>(ShareRole.VIEWER);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    createShare.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => {
          setEmail('');
          setRole(ShareRole.VIEWER);
        },
      }
    );
  };

  const handleAssign = (assigneeId: string) => {
    updateTodo.mutate({
      id: todo.id,
      input: { assigneeId: assigneeId || null },
    });
  };

  // Assignable users: the owner's share list plus the todo's current assignee
  // (if set). We show the owner as "Me" only when the current user can manage.
  const assignableOptions = [
    { value: '', label: 'Unassigned' },
    ...(canManage && user
      ? [{ value: user.id, label: `Me (${user.name ?? user.email})` }]
      : []),
    ...(shares ?? []).map((share) => ({
      value: share.userId,
      label: share.user.name ?? share.user.email,
    })),
  ];
  // Ensure the current assignee appears even if it's the owner (who is not in
  // the share list).
  if (
    todo.assignee &&
    !assignableOptions.some((o) => o.value === todo.assignee!.id)
  ) {
    assignableOptions.push({
      value: todo.assignee.id,
      label: todo.assignee.name ?? todo.assignee.email,
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Sharing &amp; assignment
      </h3>

      {/* Assignee selector */}
      <div>
        <Select
          label="Assignee"
          value={todo.assigneeId ?? ''}
          onChange={(e) => handleAssign(e.target.value)}
          options={assignableOptions}
          disabled={!canManage || updateTodo.isPending}
        />
        {!canManage && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only the owner can change the assignee.
          </p>
        )}
      </div>

      {/* Current shares */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Shared with
        </p>
        {isLoading ? (
          <Spinner />
        ) : shares && shares.length > 0 ? (
          <ul className="space-y-2">
            {shares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-200">
                  {share.user.name ?? share.user.email}
                  <span className="ml-1 text-xs text-gray-400">
                    {share.user.email}
                  </span>
                </span>
                {canManage ? (
                  <>
                    <select
                      value={share.role}
                      onChange={(e) =>
                        updateShare.mutate({
                          userId: share.userId,
                          input: { role: e.target.value as ShareRole },
                        })
                      }
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      aria-label={t('share.roleFor', { email: share.user.email })}
                    >
                      <option value={ShareRole.VIEWER}>Viewer</option>
                      <option value={ShareRole.EDITOR}>Editor</option>
                    </select>
                    <button
                      onClick={() => deleteShare.mutate(share.userId)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label={t('share.remove', { email: share.user.email })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {share.role === ShareRole.EDITOR ? 'Editor' : 'Viewer'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Not shared with anyone yet.
          </p>
        )}
      </div>

      {/* Invite by exact email */}
      {canManage && (
        <form onSubmit={handleInvite} className="space-y-2">
          <Input
            label="Invite by email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.com"
          />
          <div className="flex items-end gap-2">
            <div className="w-32">
              <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as ShareRole)}
                options={[
                  { value: ShareRole.VIEWER, label: 'Viewer' },
                  { value: ShareRole.EDITOR, label: 'Editor' },
                ]}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              loading={createShare.isPending}
              disabled={!email.trim()}
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Share
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
