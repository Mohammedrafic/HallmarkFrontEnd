import {
  DistributionLevels,
  PartnershipStatus,
  SubmissionPercentageOverrideRestriction,
} from '@shared/enums/partnership-settings';
import { PageOfCollections } from './page.model';
import { Region } from './region.model';
import { SkillCategory } from './skill-category.model';

export type AssociateOrganizationsAgency = {
  id?: number;
  organizationId: number;
  organizationName: string;
  baseFee: number;
  tier: number;
  tierTitle: string;
  exeptionFee: string;
  region: string;
  classification: string;
  orderType: string;
  skillCategory: string;
  partnershipStatus: number;
  partnershipStatusTitle: string;
  businessUnitName: string;
  agencyStatus: number;
  tierId: number;
};

export type AssociateOrganizationsAgencyPage = PageOfCollections<AssociateOrganizationsAgency>;

export type FeeExceptions = {
  id: number;
  regionId: number;
  regionName: string;
  classification: number;
  skillName: string;
  skillId: number;
  fee: number;
};

export type FeeExceptionsDTO = {
  associateOrganizationId: number;
  regionIds: number[];
  classifications: number[];
  masterSkillIds: number[];
  fee: number;
};

export type FeeSettings = {
  baseFee: number | null | undefined;
  feeExceptions: FeeExceptionsPage | undefined;
};

export type FeeExceptionsPage = PageOfCollections<FeeExceptions>;

export enum FeeSettingsClassification {
  Alumni = 0,
  International = 1,
  Interns = 2,
  Locums = 3,
  Students = 4,
  Volunteers = 5,
}

export enum JobDistributionOrderType {
  'Contract to perm' = 1,
  'Open per diem' = 2,
  'Perm placement' = 4,
  'Traveler' = 5,
}

export type FeeExceptionsInitialData = {
  regions: Region[];
  masterSkills: JobDistributionMasterSkills[];
};

export type JobDistributionMasterSkills = {
  id: number;
  businessUnitId: number;
  skillCategoryId: number;
  skillAbbr: string;
  skillDescription: string;
  isDefault: boolean;
};

export type JobDistributionInitialData = {
  regions: Region[];
  skillCategories: SkillCategory[];
};

export type PartnershipSettings = {
  status: PartnershipStatus;
  agencyCategory: DistributionLevels;
  regionIds: number[];
  skillCategoryIds: number[];
  classifications: number[];
  orderTypes: number[];
  allowOnBoard: boolean;
  allowDeployCredentials: boolean;
  excludeExperience: boolean;
  sendCandidateDistributionEmail: boolean;
  updateBySelf: boolean;
  loadAgencyCandidateDetails: boolean;
  applyProhibited: boolean;
  submissionPercentageOverrideRestriction: SubmissionPercentageOverrideRestriction;
};

export interface DepartmentsTierDTO {
  organizationId: number;
  regionIds: number[] | null,
  locationIds: number[] | null,
  departmentIds: number[] | null,
}


export type AssociateOrganizations = {
    id: number;
    name: string;
}