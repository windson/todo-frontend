import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/context/authContextValue';
import type { LoginInput, SignupInput } from '@/types';

/**
 * Access the current auth state (user, loading, isAuthenticated) and the
 * imperative login/signup/logout actions.
 */
export function useAuth() {
  return useAuthContext();
}

export function useLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      toast.success(`Welcome back${user.name ? `, ${user.name}` : ''}!`);
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log in');
    },
  });
}

export function useSignup() {
  const { signup } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: () => {
      toast.success('Account created successfully');
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log out');
    },
  });
}
