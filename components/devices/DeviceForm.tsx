'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { monthlyKwh } from '@/lib/consumption';
import ResidenceSelect from '@/components/residences/ResidenceSelect';
import ConsumptionPreview from '@/components/devices/ConsumptionPreview';
import type { Device, DeviceInput } from '@/types/devices';
import type { Member } from '@/types/members';
import type { Residence } from '@/types/residences';

const inputClass =
  'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';
const labelClass = 'flex flex-col gap-1 text-sm text-slate-500';

type Props = {
  title: string;
  submitLabel: string;
  cancelHref: string;
  residences: Residence[];
  residenceId: number;
  // Sem onResidenceChange a residência é só exibida (na edição ela não muda).
  onResidenceChange?: (id: number) => void;
  members: Member[];
  initial?: Device;
  onSubmit: (input: DeviceInput) => Promise<void>;
};

export default function DeviceForm({
  title,
  submitLabel,
  cancelHref,
  residences,
  residenceId,
  onResidenceChange,
  members,
  initial,
  onSubmit,
}: Props) {
  const [memberIds, setMemberIds] = useState<number[]>(initial?.memberIds ?? []);
  const [usage, setUsage] = useState({
    power: initial?.power?.toString() ?? '',
    hoursPerDay: initial?.hoursPerDay?.toString() ?? '',
    daysPerMonth: initial?.daysPerMonth?.toString() ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ao trocar de residência, só valem os membros que existem nela.
  const validMemberIds = memberIds.filter((id) => members.some((m) => m.id === id));

  const toggleMember = (id: number) =>
    setMemberIds((current) => (current.includes(id) ? current.filter((m) => m !== id) : [...current, id]));

  const residence = residences.find((r) => r.id === residenceId);
  const tariff = residence?.tariff;
  const [power, hours, days] = [usage.power, usage.hoursPerDay, usage.daysPerMonth].map(Number);
  const isPreviewReady = !!(usage.power && usage.hoursPerDay && usage.daysPerMonth && tariff);
  const previewKwh = isPreviewReady ? monthlyKwh(power, hours, days) : null;
  const previewCost = previewKwh !== null && tariff ? previewKwh * tariff : null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Campos opcionais vazios viram null.
    const text = (key: string) => String(form.get(key) ?? '').trim() || null;

    try {
      await onSubmit({
        name: String(form.get('name')).trim(),
        brand: text('brand'),
        model: text('model'),
        category: text('category'),
        power,
        hoursPerDay: hours,
        daysPerMonth: days,
        imageUrl: text('imageUrl'),
        residenceId,
        memberIds: validMemberIds,
      });
    } catch {
      setError('Algo deu errado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-[#1B2A41] shadow-sm sm:p-7"
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="h-1 w-11 rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nome *
            <input
              name="name" type="text" required maxLength={100} placeholder="Geladeira"
              defaultValue={initial?.name ?? ''} className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Marca
            <input name="brand" type="text" maxLength={100} defaultValue={initial?.brand ?? ''} className={inputClass} />
          </label>

          <label className={labelClass}>
            Modelo
            <input name="model" type="text" maxLength={100} defaultValue={initial?.model ?? ''} className={inputClass} />
          </label>

          <label className={labelClass}>
            Categoria
            <input
              name="category" type="text" maxLength={100} placeholder="Cozinha"
              defaultValue={initial?.category ?? ''} className={inputClass}
            />
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
            <input
              name="imageUrl" type="url" placeholder="https://..."
              defaultValue={initial?.imageUrl ?? ''} className={inputClass}
            />
          </label>

          <div className="sm:col-span-2">
            {onResidenceChange ? (
              <ResidenceSelect residences={residences} value={residenceId} onChange={onResidenceChange} />
            ) : (
              <p className="text-sm text-slate-500">
                Residência: <span className="font-semibold text-dark-blue">{residence?.name}</span>
              </p>
            )}
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
                    checked={validMemberIds.includes(m.id)}
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
            {loading ? 'Salvando...' : submitLabel}
          </button>
          <Link
            href={cancelHref}
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
