export enum BillRateCategory {
  BaseRate = 1,
  Differential = 2,
  Mileage = 3,
  Overtime = 4,
}

export enum BillRateType {
  Fixed = 1,
  Times = 2,
  Additional = 3,
}

export enum BillRateUnit
{
  Currency = 1,
  Hours = 2,
  Multiplier = 3
}

export type BillRateOption = {
  id: number;
  category: BillRateCategory;
  title: string;
  type: BillRateType;
  unit: BillRateUnit;
  intervalMin: boolean;
  intervalMax: boolean;
  considerForOT: boolean;
};

export interface BillRate {
  id: number;
  billRateGroupId: number;
  billRateConfigId: number;
  billRateConfig: BillRateOption;
  rateHour: number;
  intervalMin: number | null;
  intervalMax: number | null;
  effectiveDate: string;
};

export interface OrderBillRateDto extends Omit<BillRate, 'billRateConfig' | 'billRateGroupId'> { };
