type Props = {
  name: string;
  email: string;
  onLogout: () => void;
};

const actionClass =
  'h-9 rounded-xl border border-slate-300 text-sm font-semibold text-dark-blue disabled:opacity-60';

export default function ProfileCard({ name, email, onLogout }: Props) {
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

        {/* TODO(API): troca de foto e de senha dependem de endpoints de usuário que ainda não existem. */}
        <div className="flex w-full flex-col gap-3">
          <button type="button" disabled title="Em breve" className={actionClass}>
            Alterar foto
          </button>
          <button type="button" disabled title="Em breve" className={actionClass}>
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
      </section>
    </div>
  );
}
