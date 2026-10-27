import { brl, num } from '@/lib/format';
import { ROOM_TYPES, formatArea, roomDevices, roomUsage } from '@/lib/floorplan';
import type { Device } from '@/types/devices';
import type { Room } from '@/types/floorplan';

type Props = {
  room: Room;
  devices: Device[]; // todos os dispositivos da residência
  assignedElsewhere: Set<number>;
  houseKwh: number;
  onRename: (name: string) => void;
  onAssign: (deviceId: number) => void;
  onUnassign: (deviceId: number) => void;
  onRemove: () => void;
};

export default function RoomPanel({
  room,
  devices,
  assignedElsewhere,
  houseKwh,
  onRename,
  onAssign,
  onUnassign,
  onRemove,
}: Props) {
  const usage = roomUsage(room, devices);
  const inRoom = roomDevices(room, devices).sort((a, b) => (b.monthlyKwh ?? 0) - (a.monthlyKwh ?? 0));
  const available = devices.filter((d) => !room.deviceIds.includes(d.id));
  const share = houseKwh > 0 ? Math.round((usage.kwh / houseKwh) * 100) : 0;

  return (
    <section aria-labelledby="room-title" className="rounded-xl bg-white p-5 shadow-lg">
      <label className="sr-only" htmlFor="room-name">Nome da seção</label>
      <input
        id="room-name"
        key={room.id}
        defaultValue={room.name}
        maxLength={40}
        onBlur={(e) => onRename(e.target.value.trim() || room.name)}
        className="w-full rounded-lg border border-transparent px-1 text-lg font-bold text-dark-blue hover:border-slate-300"
      />
      <p id="room-title" className="mt-1 text-sm text-gray-500">
        {ROOM_TYPES[room.type].label} · {formatArea(ROOM_TYPES[room.type].area)}
      </p>

      <p className="mt-3 text-2xl font-bold text-dark-blue">{num.format(usage.kwh)} kWh</p>
      <p className="text-sm text-gray-500">
        {brl.format(usage.cost)} no mês · {share}% da casa
      </p>

      {inRoom.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Nenhum dispositivo nesta seção.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {inRoom.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0 truncate text-dark-blue">{d.name}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-gray-500">{num.format(d.monthlyKwh ?? 0)} kWh</span>
                <button
                  type="button"
                  aria-label={`Tirar ${d.name} da seção`}
                  onClick={() => onUnassign(d.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <div className="mt-4">
          <label className="sr-only" htmlFor="room-add-device">Adicionar dispositivo à seção</label>
          <select
            id="room-add-device"
            value=""
            onChange={(e) => onAssign(Number(e.target.value))}
            className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-dark-blue"
          >
            <option value="">+ Dispositivo</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {assignedElsewhere.has(d.id) ? ' (mover)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="mt-4 text-sm font-semibold text-red-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Remover seção
      </button>
    </section>
  );
}
