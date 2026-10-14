import { api } from './client';
import type { Device } from '@/types/devices';

export function search(id: number) {
  return api<Device>('/devices/' + id, {
    method: 'GET',
  });
}