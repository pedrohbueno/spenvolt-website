'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDevice } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { useResidences } from '@/lib/hooks/use-residences';
import { EmptyResidences } from '@/components/home/ResidenceCard';
import DeviceForm from '@/components/devices/DeviceForm';
import type { Member } from '@/types/members';

export default function DeviceCreatePage() {
  const router = useRouter();
  const { residences, selectedId, select, loading, error } = useResidences();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (selectedId === null) return;
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    findMembersByResidence(token, selectedId)
      .then((list) => !ignore && setMembers(list))
      .catch(() => !ignore && setMembers([]));

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  if (loading) {
    return <p className="text-sm text-gray-500" role="status">Carregando…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }
  if (residences.length === 0 || selectedId === null) {
    return <div className="flex justify-center py-4"><EmptyResidences /></div>;
  }

  return (
    <DeviceForm
      title="Adicionar dispositivo"
      submitLabel="Salvar dispositivo"
      cancelHref="/devices"
      residences={residences}
      residenceId={selectedId}
      onResidenceChange={select}
      members={members}
      onSubmit={async (input) => {
        await createDevice(sessionStorage.getItem('token') ?? '', input);
        router.push('/devices');
      }}
    />
  );
}
