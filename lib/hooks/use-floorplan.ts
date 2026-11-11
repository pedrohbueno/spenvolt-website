'use client';

import { useEffect, useState } from 'react';
import * as floorsApi from '@/lib/api/floors';
import { defaultRoomName, isSlotFree } from '@/lib/floorplan';
import type { RoomKind } from '@/lib/house-plan';
import type { Room, RoomDto } from '@/types/floorplan';

const token = () => sessionStorage.getItem('token') ?? '';

export interface FloorInfo {
  id: number;
  name: string;
  level: number;
}

const toRoom = (dto: RoomDto): Room => ({
  id: dto.id,
  floorId: dto.floorId,
  kind: dto.roomType,
  slot: dto.slot,
  name: dto.name,
  deviceIds: dto.deviceIds,
});

export function useFloorPlan(residenceId: number) {
  const [floors, setFloors] = useState<FloorInfo[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [floorId, setFloorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    floorsApi
      .findFloors(token(), residenceId)
      .then((list) => {
        if (!active) return;
        setFloors(list.map(({ id, name, level }) => ({ id, name, level })));
        setAllRooms(list.flatMap((f) => f.rooms.map(toRoom)));
        setFloorId(list[0]?.id ?? null);
        setError(null);
      })
      .catch(() => active && setError('Não foi possível carregar a planta. Tente novamente.'))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [residenceId]);

  // Executa a chamada à API; em caso de erro mostra a mensagem e devolve null.
  async function run<T>(action: () => Promise<T>, message: string): Promise<T | null> {
    try {
      setError(null);
      return await action();
    } catch {
      setError(message);
      return null;
    }
  }

  // Cômodos do andar selecionado; a contagem e os limites por tipo valem por andar.
  const rooms = allRooms.filter((r) => r.floorId === floorId);

  return {
    floors,
    floorId,
    selectFloor: setFloorId,
    addFloor: async () => {
      const created = await run(() => floorsApi.createFloor(token(), residenceId), 'Não foi possível adicionar o andar.');
      if (!created) return;
      setFloors((prev) => [...prev, { id: created.id, name: created.name, level: created.level }]);
      setFloorId(created.id);
    },
    rooms,
    allRooms, // todos os andares: um aparelho fica em uma única seção da casa inteira
    loading,
    error,
    // Devolve null se o slot já estiver ocupado, passar do máximo ou a API recusar.
    addRoom: async (kind: RoomKind, slot: number, name?: string) => {
      if (floorId === null || !isSlotFree(kind, slot, rooms)) return null;
      const created = await run(
        () =>
          floorsApi.createRoom(token(), {
            floorId,
            roomType: kind,
            slot,
            name: name?.trim() || defaultRoomName(kind, slot),
          }),
        'Não foi possível adicionar a seção.',
      );
      if (!created) return null;
      const room = toRoom(created);
      setAllRooms((prev) => [...prev, room]);
      return room;
    },
    renameRoom: async (id: number, name: string) => {
      const done = await run(() => floorsApi.renameRoom(token(), id, name), 'Não foi possível renomear a seção.');
      if (done !== null) setAllRooms((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
    },
    removeRoom: async (id: number) => {
      const done = await run(() => floorsApi.deleteRoom(token(), id), 'Não foi possível remover a seção.');
      if (done === null) return false;
      setAllRooms((prev) => prev.filter((r) => r.id !== id));
      return true;
    },
    // Um aparelho fica em uma única seção: sai das outras ao ser atribuído (a API faz o mesmo).
    assignDevice: async (roomId: number, deviceId: number) => {
      const done = await run(
        () => floorsApi.assignDevice(token(), roomId, deviceId),
        'Não foi possível adicionar o dispositivo.',
      );
      if (done === null) return;
      setAllRooms((prev) =>
        prev.map((r) => {
          const others = r.deviceIds.filter((d) => d !== deviceId);
          return r.id === roomId ? { ...r, deviceIds: [...others, deviceId] } : { ...r, deviceIds: others };
        }),
      );
    },
    unassignDevice: async (roomId: number, deviceId: number) => {
      const done = await run(
        () => floorsApi.unassignDevice(token(), roomId, deviceId),
        'Não foi possível remover o dispositivo.',
      );
      if (done === null) return;
      setAllRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, deviceIds: r.deviceIds.filter((d) => d !== deviceId) } : r)),
      );
    },
  };
}
