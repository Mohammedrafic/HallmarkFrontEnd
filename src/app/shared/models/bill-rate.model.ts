import { MasterSkillByOrganization } from '@shared/models/skill.model';
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

export const BillRateTypes = [
  {id: BillRateType.Additional, name: 'Additional'},
  {id: BillRateType.Fixed, name: 'Fixed'},
  {id: BillRateType.Times, name: 'Times'},
]

export enum BillRateUnit
{
  Currency = 1,
  Hours = 2,
  Multiplier = 3
}

export enum BillRateCalculationType
{
    Regular = 1,
    RegularLocal,
    GuaranteedHours,
    Callback,
    Charge,
    Holiday,
    Oncall,
    Orientation = 9,
    Preceptor,
    Mileage,
    DailyOT,
    DailyPremiumOT,
    WeeklyOT,
    SevenDayOT,
    SevenDayPremiumOT,
}

export type BillRateOption = {
  id: number;
  category: BillRateCategory;
  title: string;
  billTypes: BillRateType[];
  unit: BillRateUnit;
  intervalMin: boolean;
  intervalMax: boolean;
  considerForOT: boolean;
  seventhDayOtEnabled?: boolean;
  weeklyOtEnabled?: boolean;
  dailyOtEnabled?: boolean;
  disableFixed: boolean;
  intervalMinRequired: boolean;
  intervalMaxRequired: boolean;
  disableMultiplier: boolean;
  disableAdditional: boolean;
  disableMealBreak: boolean;
  doNotRequireTime: boolean;
  disableTime: boolean;
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
  editAllowed: boolean;
  billType: boolean;
  isPredefined: boolean;
  seventhDayOtEnabled?: boolean;
  weeklyOtEnabled?: boolean;
  dailyOtEnabled?: boolean;
  isUpdated?: boolean;
}

export type ImportedBillRate = {
  orgName: string;
  region: string;
  location: string;
  department: string;
  skill: string;
  orderType: string;
  billRateTitle: string;
  billRateType: string;
  amountMultiplier: string;
  effectiveDate: string;
  intervalMin: string;
  intervalMax: string;
  considerForWeeklyOT: string;
  considerForDailyOT: string;
  considerFor7thDayOT: string;
  regularLocal: string;
  displayInTimesheet: string;
  displayInJob: string;
  errorProperties: string[];
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
  billRateConfigId: number;
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
  considerForHoliday: boolean;
  editAllowed: boolean;
  billType: number;
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
  effectiveDate: string | Date;
  intervalMin?: number;
  intervalMax?: number;
  considerForWeeklyOT: boolean;
  considerForDailyOT: boolean;
  considerFor7thDayOT: boolean;
  displayInJob: boolean;
  considerForHoliday: boolean;
  forceUpsert?: boolean;
  billType: number;
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
  effectiveDate?: string | null;
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
