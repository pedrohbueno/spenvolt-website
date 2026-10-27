'use client';

import { useEffect, useState } from 'react';
import { createRoom, loadRooms, saveRooms } from '@/lib/floorplan';
import type { Room, RoomType } from '@/types/floorplan';

export function useFloorPlan(residenceId: number) {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setRooms(loadRooms(residenceId));
  }, [residenceId]);

  function commit(next: Room[]) {
    setRooms(next);
    saveRooms(residenceId, next);
  }

  const patchRoom = (id: string, patch: (room: Room) => Room) =>
    commit(rooms.map((r) => (r.id === id ? patch(r) : r)));

  return {
    rooms,
    addRoom: (type: RoomType) => {
      const room = createRoom(type, rooms);
      commit([...rooms, room]);
      return room;
    },
    renameRoom: (id: string, name: string) => patchRoom(id, (r) => ({ ...r, name })),
    removeRoom: (id: string) => commit(rooms.filter((r) => r.id !== id)),
    // Um aparelho fica em uma única seção: sai das outras ao ser atribuído.
    assignDevice: (roomId: string, deviceId: number) =>
      commit(
        rooms.map((r) => {
          const others = r.deviceIds.filter((d) => d !== deviceId);
          return r.id === roomId ? { ...r, deviceIds: [...others, deviceId] } : { ...r, deviceIds: others };
        }),
      ),
    unassignDevice: (roomId: string, deviceId: number) =>
      patchRoom(roomId, (r) => ({ ...r, deviceIds: r.deviceIds.filter((d) => d !== deviceId) })),
  };
}
