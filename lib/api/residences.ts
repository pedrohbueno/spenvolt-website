'use server';

import { api } from './client';
import type { Residence } from '@/types/residences';

export async function search(token: string, id: number) {
  return api<Residence>('/residences/' + id, {
    method: 'GET',
    token,
  });
}

export async function findAll(token: string) {
  return api<Residence[]>('/residences', {
    method: 'GET',
    token,
  });
}