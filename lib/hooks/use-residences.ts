'use client';

import { useEffect, useState } from 'react';
import { findResidences } from '@/lib/api/residences';
import type { Residence } from '@/types/residences';

const RESIDENCE_KEY = 'residenceId';

// Carrega as residências do usuário e lembra a selecionada entre as telas.
export function useResidences() {
  const [residences, setResidences] = useState<Residence[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token') ?? '';

    findResidences(token)
      .then((list) => {
        const saved = Number(sessionStorage.getItem(RESIDENCE_KEY));
        setResidences(list);
        setSelectedId((list.find((r) => r.id === saved) ?? list[0])?.id ?? null);
      })
      .catch(() => setError('Não foi possível carregar suas residências. Tente novamente.'))
      .finally(() => setLoading(false));
  }, []);

  function select(id: number) {
    setSelectedId(id);
    sessionStorage.setItem(RESIDENCE_KEY, String(id));
  }

  return { residences, selectedId, select, loading, error };
}
