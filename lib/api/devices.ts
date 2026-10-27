'use server';

import { api } from './client';
import type { Device, DeviceInput } from '@/types/devices';

export async function search(id: number) {
  return api<Device>('/devices/' + id, {
    method: 'GET',
  });
}

export async function findDeviceById(token: string, id: number) {
  return api<Device>('/devices/' + id, {
    method: 'GET',
    token,
  });
}

export async function findDevicesByResidence(token: string, residenceId: number) {
  return api<Device[]>('/devices/residence/' + residenceId, {
    method: 'GET',
    token,
  });
}

export async function createDevice(token: string, device: DeviceInput) {
  return api<Device>('/devices', {
    method: 'POST',
    body: JSON.stringify(device),
    token,
  });
}

// TODO(API): endpoint DELETE /api/devices/{id} ainda não existe no backend.
// Se responder 204 (sem corpo), ajustar o client para não chamar res.json().
export async function deleteDevice(token: string, id: number) {
  return api<void>('/devices/' + id, {
    method: 'DELETE',
    token,
  });
}
