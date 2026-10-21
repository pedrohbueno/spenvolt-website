'use server';

import { api } from './client';
import type { Residence } from '@/types/residences';

export async function create(
  token: string,
  residence: Omit<Residence, 'id' | 'createdAt'>
) {
  return api<Residence>('/residences', {
    method: 'POST',
    body: JSON.stringify(residence),
    token,
  });
}

export async function searchResidence(token: string, id: number) {
  return api<Residence>('/residences/' + id, {
    method: 'GET',
    token,
  });
}

export async function findResidences(token: string) {
  return api<Residence[]>('/residences', {
    method: 'GET',
    token,
  });
}
