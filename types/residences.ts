export interface Residence {
  id: number;
  name: string;
  address: string;
  tariff: number;
  alertThresholdPercent?: number ;
  monthlyKwh?: number;
  monthlyCost?: number;
  monthlyCostLimit?: number;
  monthlyKwhLimit?: number ;
  createdAt: string;
}