import Link from 'next/link';
import { brl, num } from '@/lib/format';
import type { Device } from '@/types/devices';
import type { Residence } from '@/types/residences';

const TOP = 5;

export default function TopDevices({
  devices,
  residences,
  loading,
}: {
  devices: Device[];
  residences: Residence[];
  loading: boolean;
}) {
  const top = [...devices].sort((a, b) => (b.monthlyKwh ?? 0) - (a.monthlyKwh ?? 0)).slice(0, TOP);
  const residenceName = (id: number) => residences.find((r) => r.id === id)?.name ?? '';

  return (
    <section aria-labelledby="top-devices-title" className="rounded-xl bg-white p-5 shadow-lg">
      <h2 id="top-devices-title" className="text-lg font-bold text-dark-blue">
        Quem mais consome
      </h2>
      <p className="text-sm text-gray-500">Os 5 dispositivos com maior consumo no mês</p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500" role="status">Carregando…</p>
      ) : top.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Nenhum dispositivo cadastrado ainda.</p>
      ) : (
        <ol className="mt-4 divide-y divide-gray-100">
          {top.map((d, i) => (
            <li key={d.id}>
              <Link href={`/devices/${d.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50">
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dark-blue text-xs font-bold text-yellow"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-dark-blue">{d.name ?? 'Dispositivo'}</span>
                  <span className="block truncate text-xs text-gray-500">{residenceName(d.residenceId)}</span>
                </span>
                <span className="shrink-0 text-right text-sm">
                  <span className="block font-bold text-dark-blue">{num.format(d.monthlyKwh ?? 0)} kWh</span>
                  <span className="block text-xs text-gray-500">{brl.format(d.monthlyCost ?? 0)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
