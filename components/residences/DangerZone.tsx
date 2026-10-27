'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteResidence } from '@/lib/api/residence-settings';
import type { Residence } from '@/types/residences';

export default function DangerZone({ residence }: { residence: Residence }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm(`Excluir "${residence.name}"? Esta ação não pode ser desfeita.`)) return;
    setRemoving(true);
    setError(null);
    try {
      await deleteResidence(sessionStorage.getItem('token') ?? '', residence.id);
      sessionStorage.removeItem('residenceId');
      router.push('/');
    } catch {
      setError('Não foi possível excluir a residência. Tente novamente.');
      setRemoving(false);
    }
  }

  return (
    <section aria-labelledby="danger-title" className="rounded-xl border border-red-200 bg-white p-6">
      <h2 id="danger-title" className="text-lg font-bold text-red-600">Zona de perigo</h2>
      <p className="mt-1 text-sm text-gray-500">
        Excluir a residência remove também seus dispositivos e membros.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onDelete}
        disabled={removing}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
      >
        {removing ? 'Excluindo...' : 'Excluir residência'}
      </button>
    </section>
  );
}
