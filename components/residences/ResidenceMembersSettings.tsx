'use client';

import { useState } from 'react';
import { deleteMember } from '@/lib/api/members';
import MemberAvatar from '@/components/members/MemberAvatar';
import type { Member } from '@/types/members';

export default function ResidenceMembersSettings({ initial }: { initial: Member[] }) {
  const [members, setMembers] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function onRemove(member: Member) {
    if (!window.confirm(`Remover ${member.name} da residência?`)) return;
    setError(null);
    try {
      await deleteMember(sessionStorage.getItem('token') ?? '', member.id);
      setMembers((current) => current.filter((m) => m.id !== member.id));
    } catch {
      setError('Não foi possível remover o membro. Tente novamente.');
    }
  }

  return (
    <section aria-labelledby="settings-members-title" className="rounded-xl bg-white p-6 shadow-lg">
      <h2 id="settings-members-title" className="text-lg font-bold text-dark-blue">Membros</h2>

      {members.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nenhum membro nesta residência.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <MemberAvatar member={m} className="h-9 w-9 text-sm" />
                <span className="truncate text-sm font-semibold text-dark-blue">{m.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(m)}
                className="shrink-0 text-sm font-semibold text-red-600 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
