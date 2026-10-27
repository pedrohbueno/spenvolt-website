'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { deleteDevice, findDeviceById } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import DeviceSummary from '@/components/devices/DeviceSummary';
import DeviceMembers from '@/components/devices/DeviceMembers';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';

const primaryButton =
  'rounded-lg bg-dark-blue px-4 py-2 text-center text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2';
const secondaryButton =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-dark-blue focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';

export default function DeviceDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    findDeviceById(token, Number(id))
      .then(async (found) => {
        const residenceMembers = await findMembersByResidence(token, found.residenceId);
        if (ignore) return;
        setDevice(found);
        setMembers(residenceMembers.filter((m) => found.memberIds.includes(m.id)));
      })
      .catch(() => !ignore && setError('Dispositivo não encontrado ou API indisponível.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [id]);

  async function onRemove() {
    if (!device || !window.confirm(`Remover "${device.name ?? 'dispositivo'}"?`)) return;
    setRemoving(true);
    setError(null);
    try {
      await deleteDevice(sessionStorage.getItem('token') ?? '', device.id);
      router.push('/devices');
    } catch {
      setError('Não foi possível remover o dispositivo. Tente novamente.');
      setRemoving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500" role="status">Carregando dispositivo…</p>;
  }
  if (!device) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }

  const savingsHref = `/savings?q=${encodeURIComponent(device.category ?? device.name ?? '')}`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/devices" className="text-sm font-semibold text-dark-blue hover:underline">
        ← Dispositivos
      </Link>

      <DeviceSummary device={device} />
      <DeviceMembers members={members} />

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* TODO(Economize): rota /savings será criada na tela de ofertas. */}
        <Link href={savingsHref} className={primaryButton}>
          Ver alternativas mais econômicas
        </Link>
        {/* TODO(API): edição exige PUT /api/devices/{id} e a tela de edição. */}
        <button type="button" disabled className={secondaryButton}>
          Editar
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className={`${secondaryButton} text-red-600`}
        >
          {removing ? 'Removendo...' : 'Remover'}
        </button>
      </div>
    </div>
  );
}
