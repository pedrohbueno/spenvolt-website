'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import SpenVoltLogo from '@/components/spenvolt_logo';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await login(String(form.get('email')), String(form.get('password')));
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('token_expiration', String(Date.now() + 60 * 60 * 1000));
      router.push('/');
    } catch {
      setError('E-mail ou senha incorretos, ou algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
      <section className="grid place-items-center content-center bg-[#0E1A2B] px-12 text-white">
        <SpenVoltLogo className="h-auto w-full max-w-xs" />

        <h2 className="mt-5 text-3xl font-bold leading-tight">
          Energia sob <span className="text-yellow">controle</span>,
          <br />
          casa em <span className="text-[#72F45B]">harmonia</span>.
        </h2>
      </section>

      <section className="grid place-items-center bg-[#E2E8F0] p-8">
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-86 flex-col gap-3 rounded-2xl bg-white p-7 text-[#1B2A41] shadow-sm"
        >
          <h1 className="text-center text-2xl font-bold">Entrar</h1>

          <div className="h-1 w-11 rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

          <p className="text-center text-xs text-slate-500">
            Controle o consumo da sua casa
          </p>

          <label className="flex flex-col gap-1 text-sm text-slate-500">
            E-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-500">
            Senha
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]"
            />
          </label>

          {error && (
            <p role="alert" className="text-center text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-9 rounded-xl bg-[#72F45B] text-sm font-bold text-[#0E1A2B] disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Não tem conta?{' '}
            <a href="/register" className="font-bold text-green-700">
              Criar conta
            </a>
          </p>
        </form>
      </section>
    </div>
  );
}