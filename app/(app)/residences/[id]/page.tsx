'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { findDevicesByResidence } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { searchResidence } from '@/lib/api/residences';
import FloorPlan from '@/components/floorplan/FloorPlan';
import DeviceList, { EmptyDevices } from '@/components/devices/DeviceList';
import MemberAvatar from '@/components/members/MemberAvatar';
import { EmptyMembers } from '@/components/members/MemberCard';
import ResidenceTabs, { type ResidenceTab } from '@/components/residences/ResidenceTabs';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';
import type { Residence } from '@/types/residences';

const linkButton =
  'rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2';

export default function ResidencePage() {
  const { id } = useParams<{ id: string }>();
  const residenceId = Number(id);
  const [residence, setResidence] = useState<Residence | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tab, setTab] = useState<ResidenceTab>('floorplan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    Promise.all([
      searchResidence(token, residenceId),
      findDevicesByResidence(token, residenceId),
      findMembersByResidence(token, residenceId),
    ])
      .then(([found, deviceList, memberList]) => {
        if (ignore) return;
        setResidence(found);
        setDevices(deviceList);
        setMembers(memberList);
      })
      .catch(() => !ignore && setError('Residência não encontrada ou API indisponível.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [residenceId]);

  if (loading) {
    return <p className="text-sm text-gray-500" role="status">Carregando residência…</p>;
  }
  if (!residence) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm font-semibold text-dark-blue hover:underline">
            ← Início
          </Link>
          <h1 className="text-2xl font-bold">{residence.name}</h1>
          <p className="text-sm text-gray-500">{residence.address}</p>
        </div>
        <Link href={`/residences/${residence.id}/settings`} className={linkButton}>
          Configurações
        </Link>
      </div>

      <ResidenceTabs value={tab} onChange={setTab} />

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'devices' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Link href="/devices/new" className={linkButton}>+ Adicionar dispositivo</Link>
            </div>
            {devices.length === 0 ? <EmptyDevices filtered={false} /> : <DeviceList devices={devices} />}
          </div>
        )}

        {tab === 'members' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Link href="/members/new" className={linkButton}>+ Adicionar membro</Link>
            </div>
            {members.length === 0 ? (
              <EmptyMembers />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg">
                    <MemberAvatar member={m} />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-dark-blue">{m.name}</p>
                      <p className="truncate text-sm text-gray-500">{m.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'floorplan' && <FloorPlan residenceId={residence.id} devices={devices} />}
      </div>
    </div>
  );
}
