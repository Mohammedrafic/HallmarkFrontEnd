import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { PageOfCollections } from '@shared/models/page.model';

export enum PayRateCategory {
  Regular = 1
}

export enum PayRateType {
  Fixed = 1
}
export enum PayRateTitleType {
  Regular = 1
}

export const PayRateTypes = [
  {id: PayRateType.Fixed, name: 'Fixed'},
]
export const PayRateTitle = [
  {id: PayRateTitleType.Regular, name: 'Regular'},
]

export type ImportedPayRate = {
  orgName: string;
  region: string;
  location: string;
  department: string;
  skill: string;
  orderType: string;
  amountMultiplier: string;
  effectiveDate: string;
  regularLocal: string;
  errorProperties: string[];
}

export class PayRateSetup {
  payRateSettingId: number;
  payRateConfigId: number;
  regionId: number;
  regionName: string;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  skills: MasterSkillByOrganization[];
  skillName: string;
  skillId: number;
  orderTypes: number[];
  effectiveDate: string;
  amountMultiplier: number;
  regularLocal: boolean;
  editAllowed: boolean;
  payType: number;
  WorkCommitmentIds: number;
}

export class PayRateSetupPost {
  payRateSettingId?: number;
  regionIds: number[];
  locationIds: number[];
  departmentIds: number[];
  skillIds: number[];
  payRateConfigId: number;
  orderTypes: number[];
  amountMultiplier: string;
  effectiveDate: string | Date;
  forceUpsert?: boolean;
  payType: number;
  workCommitmentIds : number[];
  organizationId: number;
}

export class PayRateFilters {
  pageNumber?: number;
  pageSize?: number;
  regionIds?: number[];
  locationIds?: number[];
  departmentIds?: number[];
  skillIds?: number[];
  orderTypes?: number[];
  payRateConfigId?: string[];
  payRatesCategory?: string[];
  payTypes?: string[];
  effectiveDate?: string | null;
  regularLocal?: boolean | null;
  name?: string;
  WorkCommitmentIds?: number[];
}

export type PayRateSetupPage = PageOfCollections<PayRateSetup>;
