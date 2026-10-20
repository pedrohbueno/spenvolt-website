import Link from 'next/link';
import { Residence } from '@/types/residences';
import { Status, computeStatus, usagePercent } from '@/lib/consumption';
import { brl, num } from '@/lib/format';
import { getUsage } from '@/lib/api/usage';

const STATUS_UI: Record<Status, { label: string; badge: string; bar: string }> = {
  ok: { label: 'Tranquilo', badge: 'bg-green-500 text-white', bar: 'bg-green-500' },
  warning: { label: 'Em alerta', badge: 'bg-yellow-400 text-black', bar: 'bg-yellow-400' },
  exceeded: { label: 'Limite estourado', badge: 'bg-red-500 text-white', bar: 'bg-red-500' },
  'no-limit': { label: 'Sem limite', badge: 'bg-gray-300 text-gray-800', bar: 'bg-gray-400' },
};

export function ResidenceCard({ residence: r }: { residence: Residence }) {
  const usage = getUsage(r); // TODO(API): ver getUsage
  const limitKwh = r.monthlyKwhLimit ?? 0;
  const status = computeStatus(usage.kwh, limitKwh, r.alertThresholdPercent);
  const ui = STATUS_UI[status];
  const pct = Math.min(usagePercent(usage.kwh, limitKwh), 100);
  const remaining = limitKwh ? limitKwh - usage.kwh : null;

  return (
    <article className="w-100 max-w-[85vw] shrink-0 snap-start rounded-xl bg-white shadow-lg">
      <div className="px-6 py-5">
        <div className="mb-1 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-dark-blue">{r.name}</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ui.badge}`}>
            {ui.label}
          </span>
        </div>
        <p className="mb-4 text-sm text-gray-500">{r.address}</p>

        <dl className="grid grid-cols-3 gap-2">
          <div>
            <dd className="text-xl font-bold text-dark-blue">{num.format(usage.kwh)}</dd>
            <dt className="text-xs text-gray-500">kWh no mês</dt>
          </div>
          <div>
            <dd className="text-xl font-bold text-dark-blue">{brl.format(usage.cost)}</dd>
            <dt className="text-xs text-gray-500">custo</dt>
          </div>
          <div>
            <dd className={`text-xl font-bold ${remaining !== null && remaining < 0 ? 'text-red-500' : 'text-dark-blue'}`}>
              {remaining === null ? '—' : num.format(remaining)}
            </dd>
            <dt className="text-xs text-gray-500">kWh até o limite</dt>
          </div>
        </dl>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label={`Consumo de ${r.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div className={`h-full rounded-full ${ui.bar}`} style={{ width: `${pct}%` }} />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {limitKwh
            ? `${num.format(usage.kwh)} de ${num.format(limitKwh)} kWh`
            : 'Sem limite de consumo definido'}
          {r.monthlyCostLimit ? ` · limite de ${brl.format(r.monthlyCostLimit)}` : ''}
        </p>
        <p className="text-xs text-gray-500">Tarifa: {brl.format(r.tariff)} por kWh</p>
      </div>
    </article>
  );
}

export function EmptyResidences() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-dark-blue">Você ainda não tem residências</h2>
      <p className="text-sm text-gray-500">
        Cadastre sua primeira casa para acompanhar o consumo e o custo de energia.
      </p>
      {/* TODO(API): rota da tela de criação de residência (ajustar quando existir). */}
      <Link
        href="/residences/new"
        className="mt-2 rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Nova residência
      </Link>
    </div>
  );
}