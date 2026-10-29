'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createDevice } from '@/lib/api/devices';
import { findMembersByResidence } from '@/lib/api/members';
import { monthlyKwh } from '@/lib/consumption';
import { useResidences } from '@/lib/hooks/use-residences';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import { EmptyResidences } from '@/components/home/ResidenceCard';
import ConsumptionPreview from '@/components/devices/ConsumptionPreview';
import type { Member } from '@/types/members';

const inputClass =
  'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';
const labelClass = 'flex flex-col gap-1 text-sm text-slate-500';

export default function DeviceCreatePage() {
  const router = useRouter();
  const { residences, selectedId, select, loading: loadingResidences, error: residencesError } = useResidences();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [usage, setUsage] = useState({ power: '', hoursPerDay: '', daysPerMonth: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  function changeResidence(id: number) {
    select(id);
    setMemberIds([]);
  }

  function toggleMember(id: number) {
    setMemberIds((current) =>
      current.includes(id) ? current.filter((m) => m !== id) : [...current, id],
    );
  }

  const tariff = residences.find((r) => r.id === selectedId)?.tariff;
  const [power, hours, days] = [usage.power, usage.hoursPerDay, usage.daysPerMonth].map(Number);
  const isPreviewReady = !!(usage.power && usage.hoursPerDay && usage.daysPerMonth && tariff);
  const previewKwh = isPreviewReady ? monthlyKwh(power, hours, days) : null;
  const previewCost = previewKwh !== null && tariff ? previewKwh * tariff : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedId === null) return;
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Campos opcionais vazios viram null.
    const text = (key: string) => String(form.get(key) ?? '').trim() || null;

    try {
      const token = sessionStorage.getItem('token') ?? '';
      await createDevice(token, {
        name: String(form.get('name')).trim(),
        brand: text('brand'),
        model: text('model'),
        category: text('category'),
        power,
        hoursPerDay: hours,
        daysPerMonth: days,
        imageUrl: text('imageUrl'),
        residenceId: selectedId,
        memberIds,
      });
      router.push('/devices');
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
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-[#1B2A41] shadow-sm sm:p-7"
      >
        <h1 className="text-2xl font-bold">Adicionar dispositivo</h1>
        <div className="h-1 w-11 rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nome *
            <input name="name" type="text" required maxLength={100} placeholder="Geladeira" className={inputClass} />
          </label>

          <label className={labelClass}>
            Marca
            <input name="brand" type="text" maxLength={100} className={inputClass} />
          </label>

          <label className={labelClass}>
            Modelo
            <input name="model" type="text" maxLength={100} className={inputClass} />
          </label>

          <label className={labelClass}>
            Categoria
            <input name="category" type="text" maxLength={100} placeholder="Cozinha" className={inputClass} />
          </label>

          <label className={labelClass}>
            Potência (W) *
            <input
              type="number" required min="0" step="any" className={inputClass}
              value={usage.power}
              onChange={(e) => setUsage({ ...usage, power: e.target.value })}
            />
          </label>

          <label className={labelClass}>
            Horas/dia *
            <input
              type="number" required min="0" max="24" step="any" className={inputClass}
              value={usage.hoursPerDay}
              onChange={(e) => setUsage({ ...usage, hoursPerDay: e.target.value })}
            />
          </label>

          <label className={labelClass}>
            Dias/mês *
            <input
              type="number" required min="0" max="31" step="1" className={inputClass}
              value={usage.daysPerMonth}
              onChange={(e) => setUsage({ ...usage, daysPerMonth: e.target.value })}
            />
          </label>

          <label className={`${labelClass} sm:col-span-2`}>
            URL da imagem
            <input name="imageUrl" type="url" placeholder="https://..." className={inputClass} />
          </label>

          <div className="sm:col-span-2">
            <ResidenceSelect residences={residences} value={selectedId} onChange={changeResidence} />
          </div>
        </div>

        <fieldset className="mt-1">
          <legend className="text-sm text-slate-500">Membros que usam</legend>
          {members.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Esta residência ainda não tem membros.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm has-checked:border-dark-blue has-checked:bg-dark-blue has-checked:text-yellow"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={memberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  {m.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="text-center text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="h-9 flex-1 rounded-xl bg-[#72F45B] text-sm font-bold text-dark-blue disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar dispositivo'}
          </button>
          <Link
            href="/devices"
            className="grid h-9 flex-1 place-items-center rounded-xl border border-slate-300 text-sm font-semibold text-dark-blue"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <ConsumptionPreview kwh={previewKwh} cost={previewCost} />
      </div>
    </div>
  );
}
