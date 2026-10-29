import { KIND_PLURAL } from '@/lib/floorplan';
import { KINDS, MAX_PER_FLOOR, type RoomKind } from '@/lib/house-plan';

// Cantinho da planta: quantas seções de cada tipo já existem e o máximo do andar.
export default function RoomCounts({ counts }: { counts: Record<RoomKind, number> }) {
  return (
    <ul aria-label="Seções cadastradas" className="flex flex-wrap justify-end gap-1.5">
      {KINDS.map((kind) => {
        const full = counts[kind] >= MAX_PER_FLOOR[kind];
        return (
          <li
            key={kind}
            title={full ? 'Limite atingido' : `${MAX_PER_FLOOR[kind] - counts[kind]} livres`}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              full ? 'bg-dark-blue text-yellow' : 'bg-slate-100 text-dark-blue'
            }`}
          >
            {KIND_PLURAL[kind]}{' '}
            <span className="tabular-nums">
              {counts[kind]}/{MAX_PER_FLOOR[kind]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
