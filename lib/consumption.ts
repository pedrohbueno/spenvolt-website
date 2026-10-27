export type Status = 'ok' | 'warning' | 'exceeded' | 'no-limit';

export function usagePercent(used: number, limit?: number | null) {
  if (!limit || limit <= 0) return 0;
  return (used / limit) * 100;
}

export function computeStatus(used: number, limit?: number | null, alertAt?: number | null): Status {
  if (!limit || limit <= 0) return 'no-limit';
  const pct = usagePercent(used, limit);
  if (pct >= 100) return 'exceeded';
  if (pct >= (alertAt ?? 80)) return 'warning';
  return 'ok';
}

// kWh/mês = (potência em W × horas por dia × dias por mês) / 1000
export function monthlyKwh(powerW: number, hoursPerDay: number, daysPerMonth: number) {
  return (powerW * hoursPerDay * daysPerMonth) / 1000;
}
