'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { create } from '@/lib/api/residences';

const inputClass =
  'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';
const labelClass = 'flex flex-col gap-1 text-sm text-slate-500';

export default function ResidenceCreatePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    // Campos opcionais vazios não são enviados.
    const optional = (key: string) => {
      const value = String(form.get(key) ?? '');
      return value === '' ? undefined : Number(value);
    };

    try {
      const token = sessionStorage.getItem('token') ?? '';
      await create(token, {
        name: String(form.get('name')).trim(),
        address: String(form.get('address')).trim(),
        tariff: Number(form.get('tariff')),
        monthlyKwhLimit: optional('monthlyKwhLimit'),
        monthlyCostLimit: optional('monthlyCostLimit'),
        alertThresholdPercent: optional('alertThresholdPercent'),
      });
      router.push('/');
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-86 flex-col gap-3 rounded-2xl bg-white p-7 text-[#1B2A41] shadow-sm"
      >
        <h1 className="text-center text-2xl font-bold">Criar residência</h1>

        <div className="h-1 w-11 self-center rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

        <p className="text-center text-xs text-slate-500">
          Gerencie dispositivos e consumo da sua casa
        </p>

        <label className={labelClass}>
          Nome
          <input name="name" type="text" required maxLength={100} className={inputClass} />
        </label>

        <label className={labelClass}>
          Endereço
          <input name="address" type="text" required maxLength={200} className={inputClass} />
        </label>

        <label className={labelClass}>
          Tarifa (R$/kWh)
          <input name="tariff" type="number" required min="0" step="any" className={inputClass} />
        </label>

        <label className={labelClass}>
          Limite mensal (kWh)
          <input name="monthlyKwhLimit" type="number" min="0" step="any" className={inputClass} />
        </label>

        <label className={labelClass}>
          Limite mensal (R$)
          <input name="monthlyCostLimit" type="number" min="0" step="any" className={inputClass} />
        </label>

        <label className={labelClass}>
          Alertar em (%)
          <input name="alertThresholdPercent" type="number" min="0" max="100" step="1" className={inputClass} />
        </label>

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
          {loading ? 'Criando...' : 'Criar residência'}
        </button>
      </form>
    </div>
  );
}