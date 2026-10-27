'use server';

import { api } from './client';
import type { Residence } from '@/types/residences';

// TODO(API): PUT e DELETE em /api/residences/{id} ainda não existem no backend.
export async function updateResidence(
  token: string,
  id: number,
  residence: Omit<Residence, 'id' | 'createdAt'>,
) {
  return api<Residence>('/residences/' + id, {
    method: 'PUT',
    body: JSON.stringify(residence),
    token,
  });
}

export async function deleteResidence(token: string, id: number) {
  return api<void>('/residences/' + id, {
    method: 'DELETE',
    token,
  });
}
