'use server';

import { api } from './client';
import type { Device } from '@/types/devices';

export async function search(id: number) {
  return api<Device>('/devices/' + id, {
    method: 'GET',
  });
}