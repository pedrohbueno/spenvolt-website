'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFloorPlan } from '@/lib/hooks/use-floorplan';
import { kindCounts, roomUsage } from '@/lib/floorplan';
import type { RoomKind } from '@/lib/house-plan';
import type { Device } from '@/types/devices';
import AddRoomDialog from './AddRoomDialog';
import HousePlan, { type PlanRoom } from './HousePlan';
import RoomCounts from './RoomCounts';
import RoomPanel from './RoomPanel';

export default function FloorPlan({ residenceId, devices }: { residenceId: number; devices: Device[] }) {
  const plan = useFloorPlan(residenceId);
  const router = useRouter();
  const pathname = usePathname();
  const roomParam = useSearchParams().get('room');
  const [dialog, setDialog] = useState<{ kind?: RoomKind; slot?: number } | null>(null);

  // A seleção fica na URL (?room=<id>), que é onde o HousePlan a coloca ao clicar num cômodo.
  const selected = plan.rooms.find((r) => r.id === roomParam) ?? null;
  const houseKwh = devices.reduce((sum, d) => sum + (d.monthlyKwh ?? 0), 0);
  const assignedIds = new Set(plan.rooms.flatMap((r) => r.deviceIds));

  const planRooms: PlanRoom[] = plan.rooms.map((r) => ({
    id: r.id,
    kind: r.kind,
    slot: r.slot,
    name: r.name,
    kwh: roomUsage(r, devices).kwh,
  }));

  const select = (id: string | null) =>
    router.replace(id ? `${pathname}?room=${id}` : pathname, { scroll: false });

  function confirmAdd(kind: RoomKind, slot: number, name: string) {
    const room = plan.addRoom(kind, slot, name);
    setDialog(null);
    if (room) select(room.id);
  }

  function removeRoom(id: string) {
    plan.removeRoom(id);
    select(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="plan-title" className="rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="plan-title" className="text-lg font-bold text-dark-blue">Planta da residência</h2>
            <p className="text-sm text-gray-500">Cores por consumo no mês</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setDialog({})}
              className="rounded-lg bg-dark-blue px-3 py-1.5 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              + Adicionar seção
            </button>
            <RoomCounts counts={kindCounts(plan.rooms)} />
          </div>
        </div>

        <HousePlan rooms={planRooms} onAddRoom={(kind, slot) => setDialog({ kind, slot })} />
      </section>

      <div className="flex flex-col gap-4">
        {selected ? (
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
        ) : (
          <p className="rounded-xl bg-white p-5 text-sm text-gray-500 shadow-lg">
            Clique em uma seção da planta para ver e organizar os dispositivos dela.
          </p>
        )}
      </div>

      {dialog && (
        <AddRoomDialog
          rooms={plan.rooms}
          initialKind={dialog.kind}
          initialSlot={dialog.slot}
          onConfirm={confirmAdd}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
