export interface Device {
  id: number;
  name: string | null;
  brand: string | null;
  model: string | null;
  category: string | null;
  power: number | null;
  hoursPerDay: number | null;
  daysPerMonth: number | null;
  imageUrl: string | null;
  ownerId: number;
  residenceId: number;
  memberIds: number[];
  monthlyKwh: number | null;
  monthlyCost: number | null;
}

// Corpo do POST /devices. O dono vem do token; consumo e custo são calculados pela API.
export type DeviceInput = Omit<Device, 'id' | 'ownerId' | 'monthlyKwh' | 'monthlyCost'>;
