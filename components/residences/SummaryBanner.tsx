import { brl, num } from '@/lib/format';

type Props = {
  name: string;
  summary: string; // "no ritmo" | "em alerta" | "passou do limite"
  kwh: number;
  cost: number;
  residencesCount: number;
};

export default function SummaryBanner({ name, summary, kwh, cost, residencesCount }: Props) {
  return (
    <section className="flex w-full flex-col gap-6 rounded-xl bg-dark-blue p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <h1 className="text-xl text-white sm:text-2xl">
        Olá, {name || 'bem-vindo'}! Sua casa está <span className="text-yellow">{summary}</span>.
      </h1>
      <dl className="flex gap-8 text-yellow">
        <div>
          <dd className="text-2xl font-bold">{num.format(kwh)}</dd>
          <dt className="text-xs text-white/70">kWh no mês</dt>
        </div>
        <div>
          <dd className="text-2xl font-bold">{brl.format(cost)}</dd>
          <dt className="text-xs text-white/70">na conta</dt>
        </div>
        <div>
          <dd className="text-2xl font-bold">{residencesCount}</dd>
          <dt className="text-xs text-white/70">residências</dt>
        </div>
      </dl>
    </section>
  );
}