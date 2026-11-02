import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { User } from '@/types';

const getCurrentUserMock = vi.fn();
const loginMock = vi.fn();
const logoutMock = vi.fn();
vi.mock('@/api/auth', () => ({
  getCurrentUser: () => getCurrentUserMock(),
  login: (...args: unknown[]) => loginMock(...args),
  signup: vi.fn(),
  logout: () => logoutMock(),
}));

import { AuthProvider } from '@/context/AuthContext';
import { useAuthContext } from '@/context/authContextValue';

const demoUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Demo',
  createdAt: '2024-01-01T00:00:00.000Z',
};

function Consumer() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuthContext();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <button onClick={() => void login({ email: 'a@b.com', password: 'x' })}>login</button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  getCurrentUserMock.mockReset();
  loginMock.mockReset();
  logoutMock.mockReset();
});

describe('AuthContext', () => {
  it('starts loading then restores the session from getCurrentUser', async () => {
    getCurrentUserMock.mockResolvedValue(demoUser);
    renderProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authed')).toHaveTextContent('true');
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
  });

  it('remains unauthenticated when there is no session', async () => {
    getCurrentUserMock.mockRejectedValue(new Error('unauthenticated'));
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authed')).toHaveTextContent('false');
    expect(screen.getByTestId('email')).toHaveTextContent('none');
  });

  it('updates the user after a successful login and clears it on logout', async () => {
    getCurrentUserMock.mockRejectedValue(new Error('unauthenticated'));
    loginMock.mockResolvedValue(demoUser);
    logoutMock.mockResolvedValue(undefined);
    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    await waitFor(() => {
      expect(screen.getByTestId('authed')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => {
      expect(screen.getByTestId('authed')).toHaveTextContent('false');
    });
  });
});
