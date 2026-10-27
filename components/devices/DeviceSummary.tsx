import { brl, num } from '@/lib/format';
import type { Device } from '@/types/devices';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="text-2xl font-bold text-yellow">{value}</dd>
      <dt className="text-xs text-white/70">{label}</dt>
    </div>
  );
}

function buildSpecs(d: Device): string {
  const specs = [
    d.category,
    d.model,
    d.power !== null ? `${num.format(d.power)} W` : null,
    d.hoursPerDay !== null ? `${num.format(d.hoursPerDay)} h/dia` : null,
    d.daysPerMonth !== null ? `${d.daysPerMonth} dias/mês` : null,
  ];
  return specs.filter(Boolean).join(' · ');
}

export default function DeviceSummary({ device: d }: { device: Device }) {
  const title = [d.name, d.brand].filter(Boolean).join(' ') || 'Dispositivo sem nome';

  return (
    <section
      aria-labelledby="device-title"
      className="flex flex-col gap-6 rounded-xl bg-dark-blue p-6 sm:flex-row sm:items-center sm:p-8"
    >
      {d.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL externa livre, sem remotePatterns
        <img src={d.imageUrl} alt={d.name ?? 'Dispositivo'} className="h-28 w-28 shrink-0 rounded-xl bg-white object-contain" />
      ) : (
        <span
          aria-hidden="true"
          className="grid h-28 w-28 shrink-0 place-items-center rounded-xl bg-linear-to-br from-green-start to-green-end text-5xl font-bold text-dark-blue"
        >
          {(d.name ?? '?').charAt(0).toUpperCase()}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="device-title" className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-white/70">{buildSpecs(d)}</p>
        </div>

        <dl className="flex gap-8">
          <Stat value={`${num.format(d.monthlyKwh ?? 0)} kWh`} label="por mês" />
          <Stat value={brl.format(d.monthlyCost ?? 0)} label="por mês" />
        </dl>
      </div>
    </section>
  );
}
