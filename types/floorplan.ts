import type { RoomKind } from '@/lib/house-plan';

export interface Room {
  id: number;
  floorId: number;
  kind: RoomKind;
  slot: number; // número dentro do tipo: Quarto 1, Quarto 2...
  name: string;
  deviceIds: number[];
}

// Formato devolvido pela API (GET /api/floors/residence/{id}).
export interface RoomDto {
  id: number;
  floorId: number;
  roomType: RoomKind;
  slot: number;
  name: string;
  deviceIds: number[];
}

export interface FloorDto {
  id: number;
  name: string;
  level: number;
  rooms: RoomDto[];
}
