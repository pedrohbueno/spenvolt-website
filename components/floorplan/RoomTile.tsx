import { type DensityLevel, ROOM_TYPES, densityLevel, formatArea } from '@/lib/floorplan';
import type { Room } from '@/types/floorplan';

export const DENSITY_UI: Record<DensityLevel, { label: string; tile: string; dot: string }> = {
  low: { label: 'Consumo baixo', tile: 'border-green-500 bg-green-50', dot: 'bg-green-500' },
  warning: { label: 'Em alerta', tile: 'border-yellow-400 bg-yellow-50', dot: 'bg-yellow-400' },
  high: { label: 'Acima do esperado', tile: 'border-red-500 bg-red-50', dot: 'bg-red-500' },
};

type Props = {
  room: Room;
  kwh: number;
  selected: boolean;
  onSelect: () => void;
};

export default function RoomTile({ room, kwh, selected, onSelect }: Props) {
  const { area, span, height } = ROOM_TYPES[room.type];
  const ui = DENSITY_UI[densityLevel(kwh, area)];

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${room.name}, ${formatArea(area)}, ${Math.round(kwh)} kWh, ${ui.label}`}
      onClick={onSelect}
      className={`flex flex-col justify-between rounded-lg border-2 p-3 text-left text-dark-blue transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 ${span} ${height} ${ui.tile} ${
        selected ? 'ring-2 ring-dark-blue' : 'hover:shadow-md'
      }`}
    >
      <span className="text-sm font-bold">{room.name}</span>
      <span>
        <span className="block text-xs text-gray-500">{formatArea(area)}</span>
        <span className="block text-lg font-bold">{Math.round(kwh)} kWh</span>
      </span>
    </button>
  );
}
