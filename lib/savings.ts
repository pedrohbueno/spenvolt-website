import { monthlyKwh } from '@/lib/consumption';
import type { Device } from '@/types/devices';
import type { Offer } from '@/types/offers';

export const STORE_LABEL: Record<string, string> = {
  mercadolivre: 'Mercado Livre',
  fastshop: 'FastShop',
  consul: 'Consul',
};

export interface Savings {
  currentKwh: number;
  newKwh: number;
  monthlySavings: number;
  paybackMonths: number | null;
}

export function discountPercent(offer: Offer): number {
  if (!offer.price || !offer.originalPrice || offer.originalPrice <= offer.price) return 0;
  return Math.round((1 - offer.price / offer.originalPrice) * 100);
}

export function matchesQuery(device: Device, query: string): boolean {
  const term = query.trim().toLowerCase();
  return !!term && [device.category, device.name].some((v) => v?.toLowerCase().includes(term));
}

// Usa as mesmas horas e dias de uso do aparelho atual para comparar com a oferta.
export function estimateSavings(current: Device, offer: Offer, tariff: number): Savings | null {
  if (!current.power || !current.hoursPerDay || !current.daysPerMonth || !offer.power) return null;

  const currentKwh = monthlyKwh(current.power, current.hoursPerDay, current.daysPerMonth);
  const newKwh = monthlyKwh(offer.power, current.hoursPerDay, current.daysPerMonth);
  const monthlySavings = (currentKwh - newKwh) * tariff;
  const paybackMonths =
    offer.price && monthlySavings > 0 ? Math.ceil(offer.price / monthlySavings) : null;

  return { currentKwh, newKwh, monthlySavings, paybackMonths };
}
