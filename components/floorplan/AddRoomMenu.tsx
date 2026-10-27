import { ROOM_TYPES } from '@/lib/floorplan';
import type { RoomType } from '@/types/floorplan';

export default function AddRoomMenu({ onAdd }: { onAdd: (type: RoomType) => void }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg">
      <h3 className="text-sm font-bold text-dark-blue">Adicionar seção</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(ROOM_TYPES) as RoomType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-dark-blue hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            + {ROOM_TYPES[type].label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Cada tipo tem tamanho e layout fixos. A planta se monta sozinha.
      </p>
    </div>
  );
}
