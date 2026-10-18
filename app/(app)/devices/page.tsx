'use client';

import { useState, type FormEvent } from 'react';
import { search } from '@/lib/api/devices';
import type { Device } from '@/types/devices';
import SpenVoltLogo from '@/components/spenvolt_logo';

export default function DevicesPage() {
    const [device, setDevice] = useState<Device | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setDevice(null);
        setLoading(true);
        const form = new FormData(e.currentTarget);
        try {
            console.log('URL:', process.env.API_URL, '| user:', process.env.APP_SECURITY_USER);
            setDevice(await search(Number(form.get('id'))));
        } catch {
            setError('Dispositivo não encontrado ou API indisponível.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-slate-500">
                    ID
                    <input name="id" type="number" required
                        className="h-[52px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-base text-[#1B2A41]" />
                </label>
                <button type="submit" disabled={loading}
                    className="h-[52px] rounded-xl bg-[#0E1A2B] text-base font-bold text-[#FFD43B] disabled:opacity-60">
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}

            {device && (
                <div className="rounded-xl border border-slate-300 p-4 text-sm">
                    <p className="font-bold">{device.name}</p>
                    <p>{device.brand} · {device.category}</p>
                    <p>{device.power} W</p>
                    <p>{device.monthlyKwh} kWh · R$ {device.monthlyCost}</p>
                </div>
            )}
        </>
    );
}