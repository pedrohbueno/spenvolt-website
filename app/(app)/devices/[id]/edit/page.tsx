'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { findDeviceById, updateDevice } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { searchResidence } from '@/lib/api/residences';
import DeviceForm from '@/components/devices/DeviceForm';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';
import type { Residence } from '@/types/residences';

export default function DeviceEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ device: Device; residence: Residence; members: Member[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    findDeviceById(token, Number(id))
      .then(async (device) => {
        const [residence, members] = await Promise.all([
          searchResidence(token, device.residenceId),
          findMembersByResidence(token, device.residenceId),
        ]);
        if (!ignore) setData({ device, residence, members });
      })
      .catch(() => !ignore && setError('Dispositivo não encontrado ou API indisponível.'));

    return () => {
      ignore = true;
    };
  }, [id]);

  if (error) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-gray-500" role="status">Carregando dispositivo…</p>;
  }

  return (
    <DeviceForm
      title="Editar dispositivo"
      submitLabel="Salvar alterações"
      cancelHref={`/devices/${data.device.id}`}
      residences={[data.residence]}
      residenceId={data.residence.id}
      members={data.members}
      initial={data.device}
      onSubmit={async (input) => {
        await updateDevice(sessionStorage.getItem('token') ?? '', data.device.id, input);
        router.push(`/devices/${data.device.id}`);
      }}
    />
  );
}
