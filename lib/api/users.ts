'use server';

import { api } from './client';

export async function changePassword(token: string, currentPassword: string, newPassword: string) {
  return api<void>('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
    token,
  });
}
