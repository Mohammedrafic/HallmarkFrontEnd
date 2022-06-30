import { MasterSkillByOrganization, Skill } from '@shared/models/skill.model';
import { PageOfCollections } from '@shared/models/page.model';

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
}

export interface OrderBillRateDto extends Omit<BillRate, 'billRateConfig' | 'billRateGroupId'> { }

export class ExternalBillRateType {
  id: number;
  billRateConfigId: number;
  name: string;
  billRateTitle: string;
}

export class ExternalBillRateSave {
  name: string;
  billRateConfigId: number = 0;
}

export class ExternalBillRateMapping {
  billRateConfigId: number;
  billRateTitle: string;
  externalBillRates: Array<{
    id: number;
    name: string;
  }>
}

export class ExternalBillRateMapped {
  externalBillRateId: number;
  externalBillRateName: string;
  mapped: boolean;
}

export class BillRateSetup {
  billRateSettingId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skills: MasterSkillByOrganization[];
  skillName: string;
  orderTypes: number[];
  billRateTitle: string;
  billRateCategory: number;
  billRateType: number;
  effectiveDate: string;
  rateHour: number;
  intervalMin: number;
  intervalMax: number;
  considerForWeeklyOT: boolean;
  considerForDailyOT: boolean;
  considerFor7thDayOT: boolean;
  regularLocal: boolean;
  displayInTimesheet: boolean;
  displayInJob: boolean;
}

export class BillRateSetupPost {
  billRateSettingId?: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  billRateConfigId: number;
  orderTypes: number[];
  rateHour: string;
  effectiveDate: string;
  intervalMin?: number;
  intervalMax?: number;
  considerForWeeklyOT: boolean;
  considerForDailyOT: boolean;
  considerFor7thDayOT: boolean;
  regularLocal: boolean;
  displayInTimesheet: boolean;
  displayInJob: boolean;
  forceUpsert?: boolean;
}

export class BillRateFilters {
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillIds?: number[];
  orderTypes?: number[];
  billRateTitleIds?: number[];
  billRateConfigIds?: string[];
  billRateCategories?: string[];
  billRateTypes?: string[];
  effectiveDate?: Date | null;
  intervalMin?: number | null;
  intervalMax?: number | null;
  considerForWeeklyOt?: boolean | null;
  considerForDailyOt?: boolean | null;
  considerFor7thDayOt?: boolean | null;
  regularLocal?: boolean | null;
  displayInTimesheet?: boolean | null;
  displayInJob?: boolean | null;
  name?: string;
}

export type BillRateSetupPage = PageOfCollections<BillRateSetup>;
export type ExternalBillRateTypePage = PageOfCollections<ExternalBillRateType>;
export type ExternalBillRateMappingPage = PageOfCollections<ExternalBillRateMapping>;
