'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { findMembersByResidence } from '@/lib/api/members';
import { searchResidence } from '@/lib/api/residences';
import DangerZone from '@/components/residences/DangerZone';
import ResidenceMembersSettings from '@/components/residences/ResidenceMembersSettings';
import ResidenceSettingsForm from '@/components/residences/ResidenceSettingsForm';
import type { Member } from '@/types/members';
import type { Residence } from '@/types/residences';

export default function ResidenceSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const [residence, setResidence] = useState<Residence | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';
    let ignore = false;

    Promise.all([searchResidence(token, Number(id)), findMembersByResidence(token, Number(id))])
      .then(([found, memberList]) => {
        if (ignore) return;
        setResidence(found);
        setMembers(memberList);
      })
      .catch(() => !ignore && setError('Residência não encontrada ou API indisponível.'))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-500" role="status">Carregando configurações…</p>;
  }
  if (!residence) {
    return <p className="text-sm text-red-600" role="alert">{error}</p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href={`/residences/${residence.id}`} className="text-sm font-semibold text-dark-blue hover:underline">
          ← {residence.name}
        </Link>
        <h1 className="text-2xl font-bold">Configurações da residência</h1>
      </div>

      <ResidenceSettingsForm residence={residence} />
      <ResidenceMembersSettings initial={members} />
      <DangerZone residence={residence} />
    </div>
  );
}
