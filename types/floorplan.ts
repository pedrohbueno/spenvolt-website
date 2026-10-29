import type { RoomKind } from '@/lib/house-plan';

export interface Room {
  id: string;
  kind: RoomKind;
  slot: number; // número dentro do tipo: Quarto 1, Quarto 2...
  name: string;
  deviceIds: number[];
}
