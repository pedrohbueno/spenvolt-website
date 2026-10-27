import type { Member } from '@/types/members';
import type { DeviceFilterState, DeviceSort } from '@/lib/devices';

type Props = {
  categories: string[];
  members: Member[];
  value: DeviceFilterState;
  onChange: (next: DeviceFilterState) => void;
};

const selectClass =
  'h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-dark-blue';

function chipClass(active: boolean) {
  return `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
    active ? 'bg-dark-blue text-yellow' : 'bg-white text-dark-blue shadow-sm hover:bg-slate-100'
  }`;
}

export default function DeviceFilters({ categories, members, value, onChange }: Props) {
  const set = (patch: Partial<DeviceFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
        {['all', ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={value.category === c}
            onClick={() => set({ category: c })}
            className={chipClass(value.category === c)}
          >
            {c === 'all' ? 'Todas' : c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="filter-member">Filtrar por membro</label>
        <select
          id="filter-member"
          value={value.memberId ?? ''}
          onChange={(e) => set({ memberId: e.target.value ? Number(e.target.value) : null })}
          className={selectClass}
        >
          <option value="">Membro: todos</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="sort-devices">Ordenar</label>
        <select
          id="sort-devices"
          value={value.sort}
          onChange={(e) => set({ sort: e.target.value as DeviceSort })}
          className={selectClass}
        >
          <option value="kwh-desc">Maior consumo</option>
          <option value="kwh-asc">Menor consumo</option>
          <option value="name">Nome (A–Z)</option>
        </select>
      </div>
    </div>
  );
}
