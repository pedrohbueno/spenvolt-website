'use server';

import { api } from './client';
import type { RoomKind } from '@/lib/house-plan';
import type { FloorDto, RoomDto } from '@/types/floorplan';

export async function findFloors(token: string, residenceId: number) {
  return api<FloorDto[]>('/floors/residence/' + residenceId, {
    method: 'GET',
    token,
  });
}

export async function createFloor(token: string, residenceId: number, name?: string) {
  return api<FloorDto>('/floors/residence/' + residenceId, {
    method: 'POST',
    body: JSON.stringify({ name }),
    token,
  });
}

export async function createRoom(
  token: string,
  room: { floorId: number; roomType: RoomKind; slot: number; name: string },
) {
  return api<RoomDto>('/rooms', {
    method: 'POST',
    body: JSON.stringify(room),
    token,
  });
}

export async function renameRoom(token: string, id: number, name: string) {
  return api<void>('/rooms/' + id, {
    method: 'PUT',
    body: JSON.stringify({ name }),
    token,
  });
}

export async function deleteRoom(token: string, id: number) {
  return api<void>('/rooms/' + id, {
    method: 'DELETE',
    token,
  });
}

export async function assignDevice(token: string, roomId: number, deviceId: number) {
  return api<void>(`/rooms/${roomId}/devices/${deviceId}`, {
    method: 'PUT',
    token,
  });
}

export async function unassignDevice(token: string, roomId: number, deviceId: number) {
  return api<void>(`/rooms/${roomId}/devices/${deviceId}`, {
    method: 'DELETE',
    token,
  });
}
