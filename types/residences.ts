export interface Residence {
  id: number;
  name: string | null;
  address: string | null;
  tariff: number | null;
  alertThresholdPercent: number | null;
  monthlyCostLimit: number | null;
  monthlyKwhLimit: number | null;
  createdAt: string;
}