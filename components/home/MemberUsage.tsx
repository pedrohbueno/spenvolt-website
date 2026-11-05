import ConsumptionBars from '@/components/members/ConsumptionBars';
import { brl, num } from '@/lib/format';
import type { MemberConsumption } from '@/types/members';

export default function MemberUsage({ members, loading }: { members: MemberConsumption[]; loading: boolean }) {
  return (
    <section aria-labelledby="member-usage-title" className="rounded-xl bg-white p-5 shadow-lg">
      <h2 id="member-usage-title" className="text-lg font-bold text-dark-blue">
        Consumo por membro
      </h2>
      <p className="mb-4 text-sm text-gray-500">Cada aparelho divide o consumo entre quem o usa</p>

      {loading ? (
        <p className="text-sm text-gray-500" role="status">Carregando…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum membro cadastrado ainda.</p>
      ) : (
        <ConsumptionBars
          label="Consumo por membro"
          items={members.map((m) => ({
            id: m.memberId,
            label: m.name,
            value: m.kwh,
            caption: `${num.format(m.kwh)} kWh · ${brl.format(m.cost)}`,
          }))}
        />
      )}
    </section>
  );
}
