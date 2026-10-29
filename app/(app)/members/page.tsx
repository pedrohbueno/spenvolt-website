'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { findDevicesByResidence } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { useResidences } from '@/lib/hooks/use-residences';
import { devicesOfMember, usageByMember } from '@/lib/members';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import { EmptyResidences } from '@/components/home/ResidenceCard';
import MemberCard, { EmptyMembers } from '@/components/members/MemberCard';
import MemberDetail from '@/components/members/MemberDetail';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';

export default function MembersPage() {
  const { residences, selectedId, select, loading: loadingResidences, error: residencesError } = useResidences();
  const [members, setMembers] = useState<Member[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null) return;
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    setLoading(true);
    setError(null);
    Promise.all([findMembersByResidence(token, selectedId), findDevicesByResidence(token, selectedId)])
      .then(([memberList, deviceList]) => {
        if (ignore) return;
        setMembers(memberList);
        setDevices(deviceList);
      })
      .catch(() => !ignore && setError('Não foi possível carregar os membros. Tente novamente.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  function changeResidence(id: number) {
    select(id);
    setActiveMemberId(null);
  }

  const usage = useMemo(() => usageByMember(devices), [devices]);
  const activeMember = members.find((m) => m.id === activeMemberId) ?? null;

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
    <section aria-labelledby="members-title" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 id="members-title" className="text-2xl font-bold">Membros</h1>
        <div className="flex items-center gap-3">
          <ResidenceSelect residences={residences} value={selectedId} onChange={changeResidence} />
          <Link
            href="/members/new"
            className="rounded-lg bg-dark-blue px-4 py-2 text-sm font-semibold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            + Adicionar membro
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500" role="status">Carregando membros…</p>
      ) : error ? (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      ) : members.length === 0 ? (
        <EmptyMembers />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                usage={usage.get(m.id) ?? { kwh: 0, cost: 0 }}
                selected={m.id === activeMemberId}
                onSelect={() => setActiveMemberId(m.id === activeMemberId ? null : m.id)}
              />
            ))}
          </ul>

          {activeMember && (
            <MemberDetail member={activeMember} devices={devicesOfMember(devices, activeMember.id)} />
          )}
        </>
      )}
    </section>
  );
}
