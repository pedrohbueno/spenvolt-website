import { brl, num } from '@/lib/format';
import type { MemberUsage } from '@/lib/members';
import type { Member } from '@/types/members';
import MemberAvatar from './MemberAvatar';

type Props = {
  member: Member;
  usage: MemberUsage;
  selected: boolean;
  onSelect: () => void;
};

export default function MemberCard({ member, usage, selected, onSelect }: Props) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={`flex w-full flex-col gap-4 rounded-xl bg-white p-5 text-left shadow-lg transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 ${
          selected ? 'ring-2 ring-dark-blue' : 'hover:shadow-xl'
        }`}
      >
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} />
          <div className="min-w-0">
            <h2 className="truncate font-bold text-dark-blue">{member.name}</h2>
            <p className="truncate text-sm text-gray-500">{member.email}</p>
          </div>
        </div>

        <dl className="flex gap-8">
          <div>
            <dd className="text-xl font-bold text-dark-blue">{num.format(usage.kwh)} kWh</dd>
            <dt className="text-xs text-gray-500">no mês</dt>
          </div>
          <div>
            <dd className="text-xl font-bold text-dark-blue">{brl.format(usage.cost)}</dd>
            <dt className="text-xs text-gray-500">atribuído</dt>
          </div>
        </dl>
      </button>
    </li>
  );
}

export function EmptyMembers() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-dark-blue">Nenhum membro cadastrado ainda</h2>
      <p className="text-sm text-gray-500">
        Adicione quem mora na casa para ver quanto cada pessoa consome.
      </p>
    </div>
  );
}
