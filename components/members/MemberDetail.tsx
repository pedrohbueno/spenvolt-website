import Link from 'next/link';
import { brl, num } from '@/lib/format';
import { deviceShare } from '@/lib/members';
import type { Device } from '@/types/devices';
import type { Member } from '@/types/members';
import ConsumptionBars, { type BarItem } from './ConsumptionBars';

export default function MemberDetail({ member, devices }: { member: Member; devices: Device[] }) {
  const items: BarItem[] = devices
    .map((d) => {
      const share = deviceShare(d);
      return {
        id: d.id,
        label: d.name ?? 'Sem nome',
        value: share.kwh,
        caption: `${num.format(share.kwh)} kWh · ${brl.format(share.cost)}`,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <section aria-labelledby="member-detail-title" className="rounded-xl bg-white p-6 shadow-lg">
      <h2 id="member-detail-title" className="text-lg font-bold text-dark-blue">
        Dispositivos de {member.name}
      </h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          Nenhum dispositivo vinculado a este membro.{' '}
          <Link href="/devices/new" className="font-semibold text-dark-blue underline">
            Adicionar dispositivo
          </Link>
        </p>
      ) : (
        <div className="mt-4">
          <ConsumptionBars items={items} label={`Consumo de ${member.name} por dispositivo`} />
          {/* TODO(API): gráfico dos últimos 6 meses depende de um endpoint de consumo por membro. */}
        </div>
      )}
    </section>
  );
}
