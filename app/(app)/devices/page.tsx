'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { findDevicesByResidence } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { useResidences } from '@/lib/hooks/use-residences';
import { DEFAULT_FILTERS, applyDeviceFilters, getCategories, type DeviceFilterState } from '@/lib/devices';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import { EmptyResidences } from '@/components/home/ResidenceCard';
import DeviceFilters from '@/components/devices/DeviceFilters';
import DeviceList, { EmptyDevices } from '@/components/devices/DeviceList';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';

export default function DevicesPage() {
  const { residences, selectedId, select, loading: loadingResidences, error: residencesError } = useResidences();
  const [devices, setDevices] = useState<Device[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filters, setFilters] = useState<DeviceFilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null) return;
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    setLoading(true);
    setError(null);
    Promise.all([findDevicesByResidence(token, selectedId), findMembersByResidence(token, selectedId)])
      .then(([deviceList, memberList]) => {
        if (ignore) return;
        setDevices(deviceList);
        setMembers(memberList);
      })
      .catch(() => !ignore && setError('Não foi possível carregar os dispositivos. Tente novamente.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  function changeResidence(id: number) {
    select(id);
    setFilters(DEFAULT_FILTERS);
  }

  const categories = useMemo(() => getCategories(devices), [devices]);
  const visible = useMemo(() => applyDeviceFilters(devices, filters), [devices, filters]);

  if (loadingResidences) {
    return <p className="text-sm text-gray-500" role="status">Carregando…</p>;
  }
  if (residencesError) {
    return <p className="text-sm text-red-600" role="alert">{residencesError}</p>;
  }
  if (residences.length === 0) {
    return <div className="flex justify-center py-4"><EmptyResidences /></div>;
  }

  return (
    <section aria-labelledby="devices-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="devices-title" className="text-2xl font-bold">Dispositivos</h1>
        <div className="flex items-center gap-3">
          <ResidenceSelect residences={residences} value={selectedId} onChange={changeResidence} />
          <Link
            href="/devices/new"
            className="rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            + Adicionar dispositivo
          </Link>
        </div>
      </div>

      <DeviceFilters categories={categories} members={members} value={filters} onChange={setFilters} />

      {loading ? (
        <p className="text-sm text-gray-500" role="status">Carregando dispositivos…</p>
      ) : error ? (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      ) : visible.length === 0 ? (
        <EmptyDevices filtered={devices.length > 0} />
      ) : (
        <DeviceList devices={visible} />
      )}
    </section>
  );
}
