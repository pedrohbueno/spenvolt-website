'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { findDevicesByResidence } from '@/lib/api/devices';
import { searchOffers } from '@/lib/api/offers';
import { getCategories } from '@/lib/devices';
import { useResidences } from '@/lib/hooks/use-residences';
import { estimateSavings, matchesQuery } from '@/lib/savings';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import OfferSearchBar from '@/components/savings/OfferSearchBar';
import OfferCard from '@/components/savings/OfferCard';
import type { Device } from '@/types/devices';
import type { Offer } from '@/types/offers';

const selectClass = 'h-9 rounded-xl border border-slate-300 bg-white px-3 text-sm text-dark-blue';

export default function SavingsContent() {
  const initialQuery = useSearchParams().get('q') ?? '';
  const { residences, selectedId, select, error: residencesError } = useResidences();
  const [query, setQuery] = useState(initialQuery);
  const [devices, setDevices] = useState<Device[]>([]);
  const [compareId, setCompareId] = useState<number | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null) return;
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    findDevicesByResidence(token, selectedId)
      .then((list) => !ignore && setDevices(list))
      .catch(() => !ignore && setDevices([]));

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!query) return;
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    setLoading(true);
    setError(null);
    searchOffers(token, query)
      .then((list) => !ignore && setOffers(list.filter((o) => o.source && o.price)))
      .catch(() => !ignore && setError('Não foi possível buscar ofertas. Tente novamente.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [query]);

  function changeResidence(id: number) {
    select(id);
    setCompareId(null);
  }

  const tariff = residences.find((r) => r.id === selectedId)?.tariff ?? 0;
  const compareDevice =
    devices.find((d) => d.id === compareId) ?? devices.find((d) => matchesQuery(d, query)) ?? null;

  return (
    <section aria-labelledby="savings-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="savings-title" className="text-2xl font-bold">Economize</h1>
        {residences.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <ResidenceSelect residences={residences} value={selectedId} onChange={changeResidence} />
            {devices.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <span className="sr-only sm:not-sr-only">Comparar com</span>
                <select
                  value={compareDevice?.id ?? ''}
                  onChange={(e) => setCompareId(Number(e.target.value))}
                  className={selectClass}
                >
                  {!compareDevice && <option value="">Escolha um aparelho</option>}
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {residencesError && <p className="text-sm text-red-600" role="alert">{residencesError}</p>}

      <OfferSearchBar key={query} query={query} categories={getCategories(devices)} onSearch={setQuery} />

      {!query ? (
        <p className="text-sm text-gray-500">
          Busque um produto para ver ofertas mais econômicas que o seu aparelho atual.
        </p>
      ) : loading ? (
        <p className="text-sm text-gray-500" role="status">Buscando ofertas…</p>
      ) : error ? (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma oferta encontrada para “{query}”.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              hasCompareDevice={!!compareDevice}
              savings={compareDevice && tariff ? estimateSavings(compareDevice, offer, tariff) : null}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
