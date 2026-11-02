import { apiClient } from './client';
import type { User, SignupInput, LoginInput } from '@/types';

export async function signup(input: SignupInput): Promise<User> {
  const response = await apiClient.post<User>('/auth/signup', input);
  return response.data;
}

export async function login(input: LoginInput): Promise<User> {
  const response = await apiClient.post<User>('/auth/login', input);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}
