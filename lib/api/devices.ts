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

export async function updateDevice(token: string, id: number, device: DeviceInput) {
  return api<Device>('/devices/' + id, {
    method: 'PUT',
    body: JSON.stringify(device),
    token,
  });
}

export async function findAllDevices(token: string) {
  return api<Device[]>('/devices', {
    method: 'GET',
    token,
  });
}

export async function deleteDevice(token: string, id: number) {
  return api<void>('/devices/' + id, {
    method: 'DELETE',
    token,
  });
}
