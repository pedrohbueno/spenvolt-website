import type { Device } from '@/types/devices';

export interface MemberUsage {
  kwh: number;
  cost: number;
}

// O consumo de um aparelho é dividido igualmente entre os membros que o usam.
export function deviceShare(device: Device): MemberUsage {
  const users = device.memberIds.length || 1;
  return {
    kwh: (device.monthlyKwh ?? 0) / users,
    cost: (device.monthlyCost ?? 0) / users,
  };
}

export function usageByMember(devices: Device[]): Map<number, MemberUsage> {
  const totals = new Map<number, MemberUsage>();

  for (const device of devices) {
    const share = deviceShare(device);
    for (const memberId of device.memberIds) {
      const current = totals.get(memberId) ?? { kwh: 0, cost: 0 };
      totals.set(memberId, { kwh: current.kwh + share.kwh, cost: current.cost + share.cost });
    }
  }

  return totals;
}

export function devicesOfMember(devices: Device[], memberId: number): Device[] {
  return devices.filter((d) => d.memberIds.includes(memberId));
}
