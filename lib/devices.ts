import type { Device } from '@/types/devices';

export type DeviceSort = 'kwh-desc' | 'kwh-asc' | 'name';

export interface DeviceFilterState {
  category: string; // 'all' = sem filtro
  memberId: number | null;
  sort: DeviceSort;
}

export const DEFAULT_FILTERS: DeviceFilterState = {
  category: 'all',
  memberId: null,
  sort: 'kwh-desc',
};

export function getCategories(devices: Device[]): string[] {
  const names = devices.map((d) => d.category).filter((c): c is string => !!c);
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function applyDeviceFilters(devices: Device[], filters: DeviceFilterState): Device[] {
  const filtered = devices.filter(
    (d) =>
      (filters.category === 'all' || d.category === filters.category) &&
      (filters.memberId === null || d.memberIds.includes(filters.memberId)),
  );

  const kwh = (d: Device) => d.monthlyKwh ?? 0;
  const sorters: Record<DeviceSort, (a: Device, b: Device) => number> = {
    'kwh-desc': (a, b) => kwh(b) - kwh(a),
    'kwh-asc': (a, b) => kwh(a) - kwh(b),
    name: (a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR'),
  };

  return [...filtered].sort(sorters[filters.sort]);
}
