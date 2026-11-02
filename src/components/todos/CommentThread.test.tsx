import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Comment } from '@/types';

const getCommentsMock = vi.fn();
const createCommentMock = vi.fn();
const updateCommentMock = vi.fn();
const deleteCommentMock = vi.fn();
vi.mock('@/api/comments', () => ({
  getComments: (...args: unknown[]) => getCommentsMock(...args),
  createComment: (...args: unknown[]) => createCommentMock(...args),
  updateComment: (...args: unknown[]) => updateCommentMock(...args),
  deleteComment: (...args: unknown[]) => deleteCommentMock(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { CommentThread } from '@/components/todos/CommentThread';

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'comment-1',
    body: 'Looks **good** to me',
    todoId: 'todo-1',
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  getCommentsMock.mockReset();
  createCommentMock.mockReset();
  updateCommentMock.mockReset();
  deleteCommentMock.mockReset();
});

describe('CommentThread', () => {
  it('renders existing comments with their markdown body', async () => {
    getCommentsMock.mockResolvedValue([makeComment()]);

    const { container } = renderWithClient(<CommentThread todoId="todo-1" />);

    await waitFor(() => {
      expect(container.querySelector('strong')?.textContent).toBe('good');
    });
  });

  it('submits a new comment via the create mutation', async () => {
    getCommentsMock.mockResolvedValue([]);
    createCommentMock.mockResolvedValue(makeComment({ body: 'New comment' }));

    renderWithClient(<CommentThread todoId="todo-1" />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText('Add a comment');
    fireEvent.change(textarea, { target: { value: 'New comment' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comment' }));

    await waitFor(() => {
      expect(createCommentMock).toHaveBeenCalledWith('todo-1', { body: 'New comment' });
    });
  });
});
