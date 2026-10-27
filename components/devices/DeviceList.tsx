import Link from 'next/link';
import type { ReactNode } from 'react';
import { brl, num } from '@/lib/format';
import type { Device } from '@/types/devices';

const COLUMNS = 'md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]';
const HEADERS = ['Nome', 'Marca', 'Categoria', 'Potência', 'Consumo', 'Custo/mês'];

// No mobile cada célula mostra o próprio rótulo; no desktop, o cabeçalho da tabela.
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-dark-blue">
      <span className="block text-xs text-gray-500 md:hidden">{label}</span>
      {children}
    </div>
  );
}

function DeviceRow({ device: d }: { device: Device }) {
  const name = d.name ?? 'Sem nome';

  return (
    <li className={`grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-sm md:items-center ${COLUMNS}`}>
      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-green-start to-green-end font-bold text-dark-blue"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <Link
          href={`/devices/${d.id}`}
          className="font-semibold text-dark-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {name}
        </Link>
      </div>

      <Cell label="Marca">{d.brand ?? '—'}</Cell>
      <Cell label="Categoria">{d.category ?? '—'}</Cell>
      <Cell label="Potência">{d.power !== null ? `${num.format(d.power)} W` : '—'}</Cell>
      <Cell label="Consumo">{num.format(d.monthlyKwh ?? 0)} kWh</Cell>
      <Cell label="Custo/mês">
        <span className="font-semibold">{brl.format(d.monthlyCost ?? 0)}</span>
      </Cell>
    </li>
  );
}

export default function DeviceList({ devices }: { devices: Device[] }) {
  return (
    <div className="rounded-xl bg-white shadow-lg">
      <div
        aria-hidden="true"
        className={`hidden gap-4 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase text-gray-500 md:grid ${COLUMNS}`}
      >
        {HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>

      <ul className="divide-y divide-gray-100">
        {devices.map((d) => (
          <DeviceRow key={d.id} device={d} />
        ))}
      </ul>
    </div>
  );
}

export function EmptyDevices({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-dark-blue">
        {filtered ? 'Nenhum dispositivo neste filtro' : 'Nenhum dispositivo cadastrado ainda'}
      </h2>
      <p className="text-sm text-gray-500">
        {filtered
          ? 'Ajuste os filtros para ver outros aparelhos.'
          : 'Adicione os aparelhos da casa para acompanhar o consumo de cada um.'}
      </p>
      {!filtered && (
        <Link
          href="/devices/new"
          className="mt-2 rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Adicionar dispositivo
        </Link>
      )}
    </div>
  );
}
