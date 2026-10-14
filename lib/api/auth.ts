import { api } from './client';
import type { User } from '@/types/user';

export function login(email: string, password: string) {
  return api<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}