'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

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
      const user = await login(String(form.get('email')), String(form.get('password')));
      localStorage.setItem('spenvolt:user', JSON.stringify(user)); // provisório
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError('E-mail ou senha incorretos.');
      else if (err instanceof ApiError && err.status === 0) setError(err.message);
      else setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Image src="/brand/spenvolt-logo.svg" alt="SpenVolt" width={120} height={120} priority className="h-auto w-[120px]" />
      <p className="text-2xl font-bold">
        Spen<span className="text-[#FFD43B]">Volt</span>
      </p>
      <p className="mb-2 text-sm text-slate-300">Energia sob controle, casa em harmonia.</p>

      <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 text-[#1B2A41]">
        <h1 className="text-2xl font-bold">Entrar</h1>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          E-mail
          <input name="email" type="email" required autoComplete="email"
            className="h-[52px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-base text-[#1B2A41]" />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-slate-500">
          Senha
          <input name="password" type="password" required autoComplete="current-password"
            className="h-[52px] rounded-xl border border-slate-300 bg-slate-50 px-3.5 text-base text-[#1B2A41]" />
        </label>

        {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading}
          className="h-[52px] rounded-xl bg-[#0E1A2B] text-base font-bold text-[#FFD43B] disabled:opacity-60">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </>
  );
}