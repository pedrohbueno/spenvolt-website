'use server';
import { api } from './client';
import type { History } from '@/types/history';

export async function findHistory(token: string) {
  return api<History[]>('/history', {
    method: 'GET',
    token,
  });
}

// export async function findByResidence(token: string) {
//   return api<History>('/history', {
//     method: 'GET',
//     token,
//   });
// }


