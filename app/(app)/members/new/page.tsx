'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createMember } from '@/lib/api/members';
import { useResidences } from '@/lib/hooks/use-residences';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import { EmptyResidences } from '@/components/home/ResidenceCard';

const inputClass =
  'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';
const labelClass = 'flex flex-col gap-1 text-sm text-slate-500';

export default function MemberCreatePage() {
  const router = useRouter();
  const { residences, selectedId, select, loading: loadingResidences, error: residencesError } = useResidences();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedId === null) return;
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const token = sessionStorage.getItem('token') ?? '';
      await createMember(token, {
        name: String(form.get('name')).trim(),
        email: String(form.get('email')).trim(),
        photoUrl: String(form.get('photoUrl') ?? '').trim() || null,
        residenceId: selectedId,
      });
      router.push('/members');
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

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
    <div className="grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-86 flex-col gap-3 rounded-2xl bg-white p-7 text-[#1B2A41] shadow-sm"
      >
        <h1 className="text-center text-2xl font-bold">Adicionar membro</h1>
        <div className="h-1 w-11 self-center rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

        <label className={labelClass}>
          Nome *
          <input name="name" type="text" required maxLength={100} className={inputClass} />
        </label>

        <label className={labelClass}>
          E-mail *
          <input name="email" type="email" required autoComplete="off" className={inputClass} />
        </label>

        <label className={labelClass}>
          URL da foto
          <input name="photoUrl" type="url" placeholder="https://..." className={inputClass} />
        </label>

        <ResidenceSelect residences={residences} value={selectedId} onChange={select} />

        {error && (
          <p role="alert" className="text-center text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-9 rounded-xl bg-[#72F45B] text-sm font-bold text-dark-blue disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar membro'}
        </button>
        <Link
          href="/members"
          className="grid h-9 place-items-center rounded-xl border border-slate-300 text-sm font-semibold text-dark-blue"
        >
          Cancelar
        </Link>
      </form>
    </div>
  );
}
