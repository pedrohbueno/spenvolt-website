'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildComparison, comparisonInsight, type Metric } from '@/lib/comparison';
import type { Status, Usage } from '@/lib/consumption';
import { brl, num } from '@/lib/format';
import type { Device } from '@/types/devices';
import type { Residence } from '@/types/residences';

const METRICS: { id: Metric; label: string }[] = [
  { id: 'limit', label: '% do limite' },
  { id: 'kwh', label: 'kWh' },
  { id: 'cost', label: 'Custo' },
];

const BAR_COLOR: Record<Status, string> = {
  ok: 'bg-linear-to-r from-green-start to-green-end',
  warning: 'bg-yellow',
  exceeded: 'bg-red-500',
  'no-limit': 'bg-linear-to-r from-blue-start to-blue-end',
};

const STATUS_LABEL: Record<Status, string> = {
  ok: 'Tranquilo',
  warning: 'Em alerta',
  exceeded: 'Limite estourado',
  'no-limit': 'Sem limite',
};

const formatValue = (metric: Metric, value: number) =>
  metric === 'limit' ? `${Math.round(value)}%` : metric === 'kwh' ? `${num.format(value)} kWh` : brl.format(value);

function limitText(metric: Metric, residence: Residence, usage: Usage) {
  const kwhLimit = residence.monthlyKwhLimit ?? 0;
  const costLimit = residence.monthlyCostLimit ?? 0;
  if (metric === 'cost') {
    return costLimit > 0 ? `limite de ${brl.format(costLimit)}` : 'sem limite de custo definido';
  }
  if (kwhLimit <= 0) return 'sem limite de consumo definido';
  return metric === 'limit'
    ? `${num.format(usage.kwh)} de ${num.format(kwhLimit)} kWh`
    : `limite de ${num.format(kwhLimit)} kWh`;
}

export default function ResidenceComparison({
  residences,
  devices,
  usageOf,
}: {
  residences: Residence[];
  devices: Device[];
  usageOf: (residence: Residence) => Usage;
}) {
  const [metric, setMetric] = useState<Metric>('limit');

  if (residences.length < 2) return null;

  const rows = buildComparison(residences, devices, usageOf, metric);
  const insight = comparisonInsight(residences, usageOf);
  // Escala comum: o marcador do limite também precisa caber na barra.
  const max = Math.max(...rows.map((r) => Math.max(r.value, r.limit ?? 0)), 1);

  return (
    <section aria-labelledby="comparison-title" className="rounded-xl bg-white p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="comparison-title" className="text-lg font-bold text-dark-blue">
            Comparativo entre residências
          </h2>
          <p className="text-sm text-gray-500">Quem está perto do limite e onde o consumo se concentra</p>
        </div>

        <div role="group" aria-label="Comparar por" className="flex rounded-lg border border-slate-300 p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={metric === m.id}
              onClick={() => setMetric(m.id)}
              className="rounded-md px-3 py-1 text-sm font-semibold text-dark-blue aria-pressed:bg-dark-blue aria-pressed:text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {insight.length > 0 && (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-dark-blue">{insight.join(' ')}</p>
      )}

      <ul aria-label="Residências por consumo" className="mt-5 flex flex-col gap-5">
        {rows.map((row) => (
          <li key={row.residence.id}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <Link
                href={`/residences/${row.residence.id}`}
                className="flex min-w-0 items-center gap-2 font-semibold text-dark-blue hover:underline"
              >
                <span className="truncate">{row.residence.name}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                  {STATUS_LABEL[row.status]}
                </span>
              </Link>
              <span className="shrink-0 font-bold text-dark-blue">
                {row.limit === null && metric === 'limit' ? '—' : formatValue(metric, row.value)}
              </span>
            </div>

            <div
              role="img"
              aria-label={`${row.residence.name}: ${formatValue(metric, row.value)}`}
              className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200"
            >
              <div
                className={`h-full rounded-full ${BAR_COLOR[row.status]}`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
              {row.limit !== null && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-0.5 bg-dark-blue"
                  style={{ left: `calc(${(row.limit / max) * 100}% - 1px)` }}
                />
              )}
            </div>

            <p className="mt-1.5 text-xs text-gray-500">
              {limitText(metric, row.residence, row.usage)}
              {' · '}
              {Math.round(row.share)}% do total
              {row.deviceCount > 0 && ` · ${row.deviceCount} ${row.deviceCount === 1 ? 'dispositivo' : 'dispositivos'}`}
              {row.top && ` · maior: ${row.top.name} (${Math.round(row.top.pct)}% da casa)`}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span aria-hidden="true" className="inline-block h-3 w-0.5 bg-dark-blue" />
        Marca o limite definido para cada residência
      </p>
    </section>
  );
}
