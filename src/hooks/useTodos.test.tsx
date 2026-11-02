import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the todos API so the mutation hook calls our stub instead of the network.
const updateTodoMock = vi.fn();
vi.mock('@/api/todos', () => ({
  getTodos: vi.fn(),
  getTodo: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: (...args: unknown[]) => updateTodoMock(...args),
  deleteTodo: vi.fn(),
  bulkUpdateTodos: vi.fn(),
}));

// Capture toast calls.
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: { success: (...a: unknown[]) => toastSuccessMock(...a), error: (...a: unknown[]) => toastErrorMock(...a) },
}));

import { useUpdateTodo } from '@/hooks/useTodos';
import { ApiRequestError } from '@/api/client';

function wrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  updateTodoMock.mockReset();
  toastErrorMock.mockReset();
  toastSuccessMock.mockReset();
});

describe('useUpdateTodo optimistic-concurrency handling', () => {
  it('on a 409 conflict refetches todos and shows a refresh toast', async () => {
    updateTodoMock.mockRejectedValue(new ApiRequestError('The record was modified', 409));

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: wrapper(queryClient) });

    result.current.mutate({ id: 'todo-1', input: { title: 'New', expectedUpdatedAt: '2024-01-01T00:00:00.000Z' } });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Conflict toast (not the generic failure message) and a refetch.
    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringMatching(/updated elsewhere/i)
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todo'] });
  });

  it('on a non-409 error shows the generic failure toast', async () => {
    updateTodoMock.mockRejectedValue(new ApiRequestError('Boom', 500));

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: wrapper(queryClient) });
    result.current.mutate({ id: 'todo-1', input: { title: 'New' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastErrorMock).toHaveBeenCalledWith('Boom');
    expect(toastErrorMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/updated elsewhere/i)
    );
  });

  it('on success shows the success toast and invalidates todos', async () => {
    updateTodoMock.mockResolvedValue({ id: 'todo-1' });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: wrapper(queryClient) });
    result.current.mutate({ id: 'todo-1', input: { title: 'New' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toastSuccessMock).toHaveBeenCalledWith('Todo updated successfully');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});
