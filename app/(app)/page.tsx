'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { findResidences } from '@/lib/api/residences';
import { findDevicesByResidence } from '@/lib/api/devices';
import { findHistory } from '@/lib/api/history';
import { Residence } from '@/types/residences';
import { NO_USAGE, computeStatus, sumUsage, type Usage } from '@/lib/consumption';
import { brl, num } from '@/lib/format';
import Carousel from '@/components/carousel';
import { EmptyResidences, ResidenceCard } from '@/components/home/ResidenceCard';
import { HistorySection } from '@/components/home/HistorySection';
import type { History } from '@/types/history';

function subscribeToName(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStoredName() {
  return sessionStorage.getItem('name') ?? '';
}

export default function Home() {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [usages, setUsages] = useState<Record<number, Usage>>({});
  const [history, setHistory] = useState<History[]>([]);
  const [loadingResidences, setLoadingResidences] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const name = useSyncExternalStore(subscribeToName, getStoredName, () => '');

  useEffect(() => {
    // Segurança: token em sessionStorage fica exposto a XSS.
    // Mantido por compatibilidade com lib/api; migrar para cookie httpOnly (BFF) depois.
    const token = sessionStorage.getItem('token') ?? '';

    findResidences(token)
      .then(async (list) => {
        const entries = await Promise.all(
          list.map(async (r) => {
            const usage = await findDevicesByResidence(token, r.id).then(sumUsage, () => NO_USAGE);
            return [r.id, usage] as const;
          }),
        );
        setResidences(list);
        setUsages(Object.fromEntries(entries));
      })
      .catch((e) => {
        console.error('Error fetching residences:', e);
        setError('Não foi possível carregar suas residências. Tente novamente.');
      })
      .finally(() => setLoadingResidences(false));

    findHistory(token)
      .then(setHistory)
      .catch((e) => console.error('Error fetching history:', e))
      .finally(() => setLoadingHistory(false));
  }, []);

  const usageOf = (r: Residence) => usages[r.id] ?? NO_USAGE;
  const statusOf = (r: Residence) =>
    computeStatus(usageOf(r).kwh, r.monthlyKwhLimit, r.alertThresholdPercent);

  const totals = residences.reduce(
    (acc, r) => ({ kwh: acc.kwh + usageOf(r).kwh, cost: acc.cost + usageOf(r).cost }),
    NO_USAGE,
  );
  const anyExceeded = residences.some((r) => statusOf(r) === 'exceeded');
  const anyWarning = residences.some((r) => statusOf(r) === 'warning');
  const summary = anyExceeded ? 'passou do limite' : anyWarning ? 'em alerta' : 'no ritmo';

  return (
    <main className="p-4 sm:p-8">
      <section className="flex w-full flex-col gap-6 rounded-xl bg-dark-blue p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <h1 className="text-xl text-white sm:text-2xl">
          Olá, {name || 'bem-vindo'}! Sua casa está <span className="text-yellow">{summary}</span>.
        </h1>
        <dl className="flex gap-8 text-yellow">
          <div>
            <dd className="text-2xl font-bold">{num.format(totals.kwh)}</dd>
            <dt className="text-xs text-white/70">kWh no mês</dt>
          </div>
          <div>
            <dd className="text-2xl font-bold">{brl.format(totals.cost)}</dd>
            <dt className="text-xs text-white/70">na conta</dt>
          </div>
          <div>
            <dd className="text-2xl font-bold">{residences.length}</dd>
            <dt className="text-xs text-white/70">residências</dt>
          </div>
        </dl>
      </section>

      <section aria-labelledby="residences-title" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="residences-title" className="text-2xl font-bold">
            Minhas residências
          </h2>
          {residences.length > 0 && (
            <Link
              href="/residences/new"
              className="rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              + Nova residência
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          {loadingResidences ? (
            <p className="text-sm text-gray-500" role="status">Carregando residências…</p>
          ) : error ? (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          ) : residences.length === 0 ? (
            <EmptyResidences />
          ) : (
            <Carousel className="w-full">
              {residences.map((r) => (
                <Link key={r.id} href={`/residences/${r.id}`} className="w-full">
                  <ResidenceCard residence={r} usage={usageOf(r)} />
                </Link>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      <HistorySection items={history} loading={loadingHistory} />
    </main>
  );
}