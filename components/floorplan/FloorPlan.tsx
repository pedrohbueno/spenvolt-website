'use client';

import { useState } from 'react';
import { useFloorPlan } from '@/lib/hooks/use-floorplan';
import { roomUsage } from '@/lib/floorplan';
import type { Device } from '@/types/devices';
import AddRoomMenu from './AddRoomMenu';
import FloorPlanLegend from './FloorPlanLegend';
import RoomPanel from './RoomPanel';
import RoomTile from './RoomTile';

export default function FloorPlan({ residenceId, devices }: { residenceId: number; devices: Device[] }) {
  const plan = useFloorPlan(residenceId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = plan.rooms.find((r) => r.id === selectedId) ?? null;
  const houseKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0);
  const assignedIds = new Set(plan.rooms.flatMap((r) => r.deviceIds));

  function addRoom(type: Parameters<typeof plan.addRoom>[0]) {
    setSelectedId(plan.addRoom(type).id);
  }

  function removeRoom(id: string) {
    plan.removeRoom(id);
    setSelectedId(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="plan-title" className="rounded-xl bg-white p-5 shadow-lg">
        <h2 id="plan-title" className="text-lg font-bold text-dark-blue">Planta da residência</h2>
        <p className="mb-4 text-sm text-gray-500">Cores por consumo no mês</p>

        {plan.rooms.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Sua planta está vazia. Adicione uma seção para começar.
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-2 rounded-xl border-2 border-dark-blue p-2">
            {plan.rooms.map((room) => (
              <RoomTile
                key={room.id}
                room={room}
                kwh={roomUsage(room, devices).kwh}
                selected={room.id === selectedId}
                onSelect={() => setSelectedId(room.id === selectedId ? null : room.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4">
        {selected && (
          <RoomPanel
            room={selected}
            devices={devices}
            assignedElsewhere={assignedIds}
            houseKwh={houseKwh}
            onRename={(name) => plan.renameRoom(selected.id, name)}
            onAssign={(deviceId) => deviceId && plan.assignDevice(selected.id, deviceId)}
            onUnassign={(deviceId) => plan.unassignDevice(selected.id, deviceId)}
            onRemove={() => removeRoom(selected.id)}
          />
        )}
        <AddRoomMenu onAdd={addRoom} />
        <FloorPlanLegend />
      </div>
    </div>
  );
}
