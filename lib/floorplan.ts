import type { Device } from '@/types/devices';
import type { Room } from '@/types/floorplan';
import { KINDS, KIND_LABEL, MAX_PER_FLOOR, type RoomKind } from '@/lib/house-plan';

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

/* -------------------------------------------------------------------------- */
/* Seções por tipo                                                            */
/* -------------------------------------------------------------------------- */

export const KIND_PLURAL: Record<RoomKind, string> = {
  QUARTO: 'Quartos',
  BANHEIRO: 'Banheiros',
  COZINHA: 'Cozinhas',
  SALA: 'Salas',
  OUTROS: 'Outros',
};

export function kindCounts(rooms: Room[]): Record<RoomKind, number> {
  const counts: Record<RoomKind, number> = { QUARTO: 0, BANHEIRO: 0, COZINHA: 0, SALA: 0, OUTROS: 0 };
  for (const room of rooms) counts[room.kind] += 1;
  return counts;
}

export function freeSlots(kind: RoomKind, rooms: Room[]) {
  return Math.max(MAX_PER_FLOOR[kind] - rooms.filter((r) => r.kind === kind).length, 0);
}

export function isSlotFree(kind: RoomKind, slot: number, rooms: Room[]) {
  return slot >= 1 && slot <= MAX_PER_FLOOR[kind] && !rooms.some((r) => r.kind === kind && r.slot === slot);
}

export function nextFreeSlot(kind: RoomKind, rooms: Room[]): number | null {
  for (let slot = 1; slot <= MAX_PER_FLOOR[kind]; slot++) if (isSlotFree(kind, slot, rooms)) return slot;
  return null;
}

export const defaultRoomName = (kind: RoomKind, slot: number) =>
  MAX_PER_FLOOR[kind] > 1 ? `${KIND_LABEL[kind]} ${slot}` : KIND_LABEL[kind];

export function createRoom(kind: RoomKind, slot: number, name?: string): Room {
  return {
    id: crypto.randomUUID(),
    kind,
    slot,
    name: name?.trim() || defaultRoomName(kind, slot),
    deviceIds: [],
  };
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

/* -------------------------------------------------------------------------- */
/* Armazenamento local                                                        */
/* -------------------------------------------------------------------------- */

// TODO(API): trocar pelas rotas de Room quando o front for ligado ao backend.
// A chave tem versão para ignorar o formato antigo (type: 'bedroom'...), que não tem slot.
const storageKey = (residenceId: number) => `floorplan:v2:${residenceId}`;

const isRoom = (value: unknown): value is Room => {
  const room = value as Room;
  return (
    !!room &&
    typeof room.id === 'string' &&
    KINDS.includes(room.kind) &&
    Number.isInteger(room.slot) &&
    typeof room.name === 'string' &&
    Array.isArray(room.deviceIds)
  );
};

export function loadRooms(residenceId: number): Room[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(residenceId)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRoom) : [];
  } catch {
    return [];
  }
}

export function saveRooms(residenceId: number, rooms: Room[]) {
  try {
    localStorage.setItem(storageKey(residenceId), JSON.stringify(rooms));
  } catch {}
}
