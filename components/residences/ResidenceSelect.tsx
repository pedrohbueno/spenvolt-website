import type { Residence } from '@/types/residences';

type Props = {
  residences: Residence[];
  value: number | null;
  onChange: (id: number) => void;
};

export default function ResidenceSelect({ residences, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-500">
      <span className="sr-only sm:not-sr-only">Residência</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-dark-blue"
      >
        {residences.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
