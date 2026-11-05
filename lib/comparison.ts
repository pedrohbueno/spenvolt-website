import { computeStatus, usagePercent, type Status, type Usage } from '@/lib/consumption';
import type { Device } from '@/types/devices';
import type { Residence } from '@/types/residences';

export type Metric = 'limit' | 'kwh' | 'cost';

export interface ComparisonRow {
  residence: Residence;
  usage: Usage;
  status: Status; // cor da barra, segundo o critério escolhido
  value: number; // valor da barra (% do limite, kWh ou R$)
  limit: number | null; // marcador do limite na mesma unidade da barra
  share: number; // % do consumo total (kWh) de todas as residências
  deviceCount: number;
  top: { name: string; pct: number } | null; // aparelho que mais pesa na casa
}

type UsageOf = (residence: Residence) => Usage;

export function buildComparison(
  residences: Residence[],
  devices: Device[],
  usageOf: UsageOf,
  metric: Metric,
): ComparisonRow[] {
  const totalKwh = residences.reduce((sum, r) => sum + usageOf(r).kwh, 0);

  const rows = residences.map((residence): ComparisonRow => {
    const usage = usageOf(residence);
    const kwhLimit = residence.monthlyKwhLimit ?? 0;
    const costLimit = residence.monthlyCostLimit ?? 0;
    const alertAt = residence.alertThresholdPercent;

    const own = devices.filter((d) => d.residenceId === residence.id);
    const heaviest = own.reduce<Device | null>((a, d) => ((d.monthlyKwh ?? 0) > (a?.monthlyKwh ?? 0) ? d : a), null);

    const base = {
      residence,
      usage,
      share: totalKwh > 0 ? (usage.kwh / totalKwh) * 100 : 0,
      deviceCount: own.length,
      top:
        heaviest && usage.kwh > 0
          ? { name: heaviest.name ?? 'Dispositivo', pct: ((heaviest.monthlyKwh ?? 0) / usage.kwh) * 100 }
          : null,
    };

    if (metric === 'limit') {
      return {
        ...base,
        status: computeStatus(usage.kwh, kwhLimit, alertAt),
        value: usagePercent(usage.kwh, kwhLimit),
        limit: kwhLimit > 0 ? 100 : null,
      };
    }
    if (metric === 'kwh') {
      return { ...base, status: computeStatus(usage.kwh, kwhLimit, alertAt), value: usage.kwh, limit: kwhLimit > 0 ? kwhLimit : null };
    }
    return { ...base, status: computeStatus(usage.cost, costLimit, alertAt), value: usage.cost, limit: costLimit > 0 ? costLimit : null };
  });

  // Quem não tem limite definido não entra na régua de % do limite: vai para o fim.
  return rows.sort((a, b) => {
    if (metric === 'limit' && (a.limit === null) !== (b.limit === null)) return a.limit === null ? 1 : -1;
    return b.value - a.value;
  });
}

// Frase-resumo: quem precisa de atenção e quem mais consome.
export function comparisonInsight(residences: Residence[], usageOf: UsageOf): string[] {
  const statusOf = (r: Residence) =>
    computeStatus(usageOf(r).kwh, r.monthlyKwhLimit, r.alertThresholdPercent);
  const exceeded = residences.filter((r) => statusOf(r) === 'exceeded');
  const warning = residences.filter((r) => statusOf(r) === 'warning');
  const lines: string[] = [];

  if (exceeded.length > 0) {
    lines.push(
      exceeded.length === 1
        ? `${exceeded[0].name} passou do limite de consumo.`
        : `${exceeded.length} residências passaram do limite de consumo.`,
    );
  }
  if (warning.length > 0) {
    lines.push(
      warning.length === 1
        ? `${warning[0].name} está em alerta.`
        : `${warning.length} residências estão em alerta.`,
    );
  }
  if (lines.length === 0 && residences.some((r) => (r.monthlyKwhLimit ?? 0) > 0)) {
    lines.push('Todas as residências estão dentro do limite.');
  }

  const total = residences.reduce((sum, r) => sum + usageOf(r).kwh, 0);
  const biggest = [...residences].sort((a, b) => usageOf(b).kwh - usageOf(a).kwh)[0];
  if (biggest && total > 0) {
    lines.push(`${biggest.name} concentra ${Math.round((usageOf(biggest).kwh / total) * 100)}% do consumo total.`);
  }
  return lines;
}
