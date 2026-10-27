'use client';

import { useState } from 'react';
import { brl, num } from '@/lib/format';
import { STORE_LABEL, discountPercent, type Savings } from '@/lib/savings';
import type { Offer } from '@/types/offers';

type Props = {
  offer: Offer;
  savings: Savings | null;
  hasCompareDevice: boolean;
};

function ComparePanel({ savings }: { savings: Savings | null }) {
  if (!savings) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-sm text-gray-500">
        Faltam dados de potência ou de uso (horas/dia e dias/mês) para estimar a economia.
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
      <div>
        <dt className="text-xs text-gray-500">Seu aparelho</dt>
        <dd className="font-bold text-dark-blue">{num.format(savings.currentKwh)} kWh/mês</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Este produto</dt>
        <dd className="font-bold text-dark-blue">{num.format(savings.newKwh)} kWh/mês</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Economia</dt>
        <dd className="font-bold text-dark-blue">{brl.format(Math.max(savings.monthlySavings, 0))}/mês</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Se paga em</dt>
        <dd className="font-bold text-dark-blue">
          {savings.paybackMonths ? `${savings.paybackMonths} meses` : '—'}
        </dd>
      </div>
    </dl>
  );
}

export default function OfferCard({ offer, savings, hasCompareDevice }: Props) {
  const [comparing, setComparing] = useState(false);
  const discount = discountPercent(offer);
  const store = offer.source ? (STORE_LABEL[offer.source.toLowerCase()] ?? offer.source) : '';
  const canOpenStore = !!offer.deviceUrl?.startsWith('http');

  return (
    <li className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-lg">
      <div className="flex items-start gap-4">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa de loja, sem remotePatterns
          <img src={offer.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg bg-slate-50 object-contain" />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-linear-to-br from-green-start to-green-end text-3xl font-bold text-dark-blue"
          >
            {(offer.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-bold text-dark-blue">{offer.name}</h2>
            {discount > 0 && (
              <span className="shrink-0 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {[store, offer.power ? `${num.format(offer.power)} W` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-dark-blue">{brl.format(offer.price ?? 0)}</span>
        {discount > 0 && offer.originalPrice && (
          <span className="text-sm text-gray-500 line-through">{brl.format(offer.originalPrice)}</span>
        )}
      </div>

      {savings && savings.monthlySavings > 0 && (
        <p className="text-sm text-green-700">
          Economia estimada: {brl.format(savings.monthlySavings)}/mês
          {savings.paybackMonths ? ` · se paga em ${savings.paybackMonths} meses` : ''}
        </p>
      )}

      {comparing && <ComparePanel savings={savings} />}

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!hasCompareDevice}
          aria-expanded={comparing}
          title={hasCompareDevice ? undefined : 'Escolha um dos seus aparelhos para comparar'}
          onClick={() => setComparing((open) => !open)}
          className="flex-1 rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          Comparar com o meu
        </button>
        {canOpenStore && (
          <a
            href={offer.deviceUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ver na loja
          </a>
        )}
      </div>
    </li>
  );
}
