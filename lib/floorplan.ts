import type { Device } from '@/types/devices';
import type { Room, RoomType } from '@/types/floorplan';

export const ROOM_TYPES: Record<RoomType, { label: string; area: number; span: string; height: string }> = {
  bedroom: { label: 'Quarto', area: 7.8, span: 'col-span-3', height: 'min-h-28' },
  bathroom: { label: 'Banheiro', area: 5.5, span: 'col-span-2', height: 'min-h-28' },
  living: { label: 'Sala', area: 24.1, span: 'col-span-6', height: 'min-h-36' },
  kitchen: { label: 'Cozinha', area: 3.2, span: 'col-span-2', height: 'min-h-28' },
  laundry: { label: 'Lavanderia', area: 3.0, span: 'col-span-2', height: 'min-h-28' },
  office: { label: 'Escritório', area: 6.0, span: 'col-span-3', height: 'min-h-28' },
};

export type DensityLevel = 'low' | 'warning' | 'high';

const WARNING_KWH_PER_M2 = 6;
const HIGH_KWH_PER_M2 = 12;

export function densityLevel(kwh: number, area: number): DensityLevel {
  const density = kwh / area;
  if (density >= HIGH_KWH_PER_M2) return 'high';
  if (density >= WARNING_KWH_PER_M2) return 'warning';
  return 'low';
}

export function formatArea(area: number) {
  return area.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' m²';
}

export function roomDevices(room: Room, devices: Device[]): Device[] {
  return devices.filter((d) => room.deviceIds.includes(d.id));
}

export function roomUsage(room: Room, devices: Device[]) {
  return roomDevices(room, devices).reduce(
    (acc, d) => ({ kwh: acc.kwh + (d.monthlyKwh ?? 0), cost: acc.cost + (d.monthlyCost ?? 0) }),
    { kwh: 0, cost: 0 },
  );
}

export function createRoom(type: RoomType, rooms: Room[]): Room {
  const { label } = ROOM_TYPES[type];
  const sameType = rooms.filter((r) => r.type === type).length;
  const name = type === 'bedroom' || sameType > 0 ? `${label} ${sameType + 1}` : label;
  return { id: crypto.randomUUID(), type, name, deviceIds: [] };
}

// TODO(API): a planta não tem endpoint; fica salva só neste navegador.
const storageKey = (residenceId: number) => `floorplan:${residenceId}`;

export function loadRooms(residenceId: number): Room[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(residenceId)) ?? '[]') as Room[];
  } catch {
    return [];
  }
}

export function saveRooms(residenceId: number, rooms: Room[]) {
  try {
    localStorage.setItem(storageKey(residenceId), JSON.stringify(rooms));
  } catch {}
}
