import type { Member } from '@/types/members';

export default function DeviceMembers({ members }: { members: Member[] }) {
  return (
    <section aria-labelledby="device-members-title" className="rounded-xl bg-white p-6 shadow-lg">
      <h2 id="device-members-title" className="text-lg font-bold text-dark-blue">
        Membros que usam
      </h2>

      {members.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">Nenhum membro vinculado a este aparelho.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-4">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm text-dark-blue">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-blue-start to-blue-end font-bold text-white"
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              {m.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
