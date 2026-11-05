'use client';

import { useState, type FormEvent } from 'react';
import { changePassword } from '@/lib/api/users';

type Props = {
  name: string;
  email: string;
  onLogout: () => void;
};

const actionClass =
  'h-9 rounded-xl border border-slate-300 text-sm font-semibold text-dark-blue disabled:opacity-60';
const inputClass = 'h-9 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-[#1B2A41]';

const MIN_PASSWORD = 6;

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const current = String(form.get('current'));
    const next = String(form.get('next'));

    if (next.length < MIN_PASSWORD) return setError(`A nova senha deve ter ao menos ${MIN_PASSWORD} caracteres.`);
    if (next !== String(form.get('confirm'))) return setError('A confirmação não confere com a nova senha.');

    setError(null);
    setSaving(true);
    try {
      await changePassword(sessionStorage.getItem('token') ?? '', current, next);
      onDone();
    } catch {
      setError('Não foi possível trocar a senha. Confira a senha atual.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
      <input name="current" type="password" required placeholder="Senha atual" autoComplete="current-password" className={inputClass} />
      <input name="next" type="password" required placeholder="Nova senha" autoComplete="new-password" className={inputClass} />
      <input name="confirm" type="password" required placeholder="Confirmar nova senha" autoComplete="new-password" className={inputClass} />

      {error && (
        <p role="alert" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-9 rounded-xl bg-[#72F45B] text-sm font-bold text-dark-blue disabled:opacity-60"
      >
        {saving ? 'Salvando...' : 'Salvar nova senha'}
      </button>
      <button type="button" onClick={onDone} className={actionClass}>
        Cancelar
      </button>
    </form>
  );
}

export default function ProfileCard({ name, email, onLogout }: Props) {
  const [changing, setChanging] = useState(false);
  const [changed, setChanged] = useState(false);

  return (
    <div className="grid place-items-center">
      <section
        aria-labelledby="profile-title"
        className="flex w-full max-w-86 flex-col items-center gap-3 rounded-2xl bg-white p-7 text-[#1B2A41] shadow-sm"
      >
        <span
          aria-hidden="true"
          className="grid h-24 w-24 place-items-center rounded-full bg-linear-to-br from-green-start to-green-end text-4xl font-bold text-dark-blue"
        >
          {(name || '?').charAt(0).toUpperCase()}
        </span>

        <div className="text-center">
          <h1 id="profile-title" className="text-2xl font-bold">{name || 'Meu perfil'}</h1>
          {email && <p className="text-sm text-slate-500">{email}</p>}
        </div>

        <div className="h-1 w-11 rounded-full bg-linear-to-r from-[#72F45B] via-yellow to-sky-500" />

        {changed && (
          <p role="status" className="text-center text-xs text-green-700">
            Senha alterada com sucesso.
          </p>
        )}

        {changing ? (
          <PasswordForm
            onDone={() => {
              setChanged(true);
              setChanging(false);
            }}
          />
        ) : (
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setChanged(false);
                setChanging(true);
              }}
              className={actionClass}
            >
              Trocar senha
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-9 rounded-xl bg-dark-blue text-sm font-bold text-yellow focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Sair
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
