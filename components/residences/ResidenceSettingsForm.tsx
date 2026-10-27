'use client';

import { useState, type FormEvent } from 'react';
import { updateResidence } from '@/lib/api/residence-settings';
import type { Residence } from '@/types/residences';

const inputClass =
  'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';
const labelClass = 'flex flex-col gap-1 text-sm text-slate-500';

export default function ResidenceSettingsForm({ residence }: { residence: Residence }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Campos opcionais vazios não são enviados.
    const optional = (key: string) => {
      const value = String(form.get(key) ?? '');
      return value === '' ? undefined : Number(value);
    };

    try {
      const token = sessionStorage.getItem('token') ?? '';
      await updateResidence(token, residence.id, {
        name: String(form.get('name')).trim(),
        address: String(form.get('address')).trim(),
        tariff: Number(form.get('tariff')),
        alertThresholdPercent: optional('alertThresholdPercent'),
        monthlyKwhLimit: optional('monthlyKwhLimit'),
        monthlyCostLimit: optional('monthlyCostLimit'),
      });
      setSaved(true);
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-[#1B2A41] shadow-sm sm:p-7">
      <h2 className="text-xl font-bold">Dados da residência</h2>
      <div className="h-1 w-11 rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Nome
          <input name="name" required maxLength={100} defaultValue={residence.name} className={inputClass} />
        </label>
        <label className={labelClass}>
          Endereço
          <input name="address" required maxLength={200} defaultValue={residence.address} className={inputClass} />
        </label>
        <label className={labelClass}>
          Tarifa (R$/kWh)
          <input name="tariff" type="number" required min="0" step="any" defaultValue={residence.tariff} className={inputClass} />
        </label>
        <label className={labelClass}>
          Alerta (%)
          <input name="alertThresholdPercent" type="number" min="0" max="100" step="1" defaultValue={residence.alertThresholdPercent} className={inputClass} />
        </label>
        <label className={labelClass}>
          Limite (kWh)
          <input name="monthlyKwhLimit" type="number" min="0" step="any" defaultValue={residence.monthlyKwhLimit} className={inputClass} />
        </label>
        <label className={labelClass}>
          Limite (R$)
          <input name="monthlyCostLimit" type="number" min="0" step="any" defaultValue={residence.monthlyCostLimit} className={inputClass} />
        </label>
      </div>

      {error && <p role="alert" className="text-center text-xs text-red-600">{error}</p>}
      {saved && <p role="status" className="text-center text-xs text-green-700">Alterações salvas.</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-9 rounded-xl bg-[#72F45B] text-sm font-bold text-dark-blue disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
