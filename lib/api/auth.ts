'use server';
import { api } from './client';
import type { LoginResponse, RegisterResponse } from '@/types/auth';

export async  function login(email: string, password: string) {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  return api<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}