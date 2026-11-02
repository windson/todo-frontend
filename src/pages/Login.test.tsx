import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the auth API module so no real network request is made.
const loginMock = vi.fn();
const getCurrentUserMock = vi.fn().mockRejectedValue(new Error('unauthenticated'));
vi.mock('@/api/auth', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  signup: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: () => getCurrentUserMock(),
}));

import { Login } from '@/pages/Login';
import { AuthProvider } from '@/context/AuthContext';

function renderLogin() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return render(<Login />, { wrapper });
}

beforeEach(() => {
  loginMock.mockReset();
});

describe('Login page', () => {
  it('renders the email and password fields and a submit button', async () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    // Let the AuthProvider's initial session check settle to avoid act() warnings.
    await waitFor(() => expect(getCurrentUserMock).toHaveBeenCalled());
  });

  it('calls the login mutation with the entered credentials on submit', async () => {
    loginMock.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
