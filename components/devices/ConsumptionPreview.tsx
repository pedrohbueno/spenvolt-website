import { brl, num } from '@/lib/format';

type Props = {
  kwh: number | null; // null = campos ainda incompletos
  cost: number | null;
};

export default function ConsumptionPreview({ kwh, cost }: Props) {
  return (
    <aside aria-live="polite" className="rounded-xl bg-dark-blue p-6 text-white">
      <h2 className="text-sm font-semibold text-white/70">Prévia ao vivo</h2>

      {kwh === null || cost === null ? (
        <p className="mt-3 text-sm text-white/70">
          Preencha potência, horas por dia, dias por mês e a residência para ver a estimativa.
        </p>
      ) : (
        <>
          <dl className="mt-3 flex gap-8 text-yellow">
            <div>
              <dd className="text-2xl font-bold">{num.format(kwh)}</dd>
              <dt className="text-xs text-white/70">kWh/mês</dt>
            </div>
            <div>
              <dd className="text-2xl font-bold">{brl.format(cost)}</dd>
              <dt className="text-xs text-white/70">por mês</dt>
            </div>
          </dl>
          <p className="mt-4 text-sm text-white/80">
            Este aparelho vai consumir {num.format(kwh)} kWh e custar {brl.format(cost)} por mês.
          </p>
        </>
      )}
    </aside>
  );
}
