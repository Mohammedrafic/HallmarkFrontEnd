import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';

export class AgencyCommonFilterReportOptions {
  orderStatuses: OrderStatusDto[];
  jobStatuses: JobStatusDto[];
  candidateStatuses: {
    status: ApplicantStatus;
    statusText: string;
  }[];
  masterSkills: MasterSkillDto[];
  skillCategories: SkillCategoryDto[];
  timesheetStatuses: timesheetStatusesDto[];
  candidateStatusesAndReasons: CandidateStatusAndReasonFilterOptionsDto[];
  jobStatusesAndReasons: JobStatusAndReasonFilterOptionsDto[];
  allCandidateStatusesAndReasons: CandidateStatusAndReasonFilterOptionsDto[];
  allJobStatusesAndReasons: JobStatusAndReasonFilterOptionsDto[];
  invoiceStatuses:FilterOption[];
}

export class CandidateStatusAndReasonFilterOptionsDto {
  status: number;
  statusText: string;
}

export class JobStatusAndReasonFilterOptionsDto {
  status: number;
  statusText: string;
}

export class JobStatusDto {
  status: OrderStatus;
  statusText: string;
}
export class OrderStatusDto {
  id: number;
  status: string;
  statusText: string;
}
export class CandidateStatusDto {
  status: ApplicantStatus;
  statusText: string;
}
export class MasterSkillDto {
  id: number;
  organizationid?: number;
  skillCategoryId: number;
  Name: string;
  Description: string;
  Abbr: string;
}
export class SkillCategoryDto {
  id: number;
  name: string;
}
export class timesheetStatusesDto {
  id: number;
  name: string;
}
export class CommonReportFilter {
  businessUnitIds: number[];
}
export class CommonAgencyCandidateSearchFilter {
  searchText: string;
  businessUnitIds: number[] | null;
  agencyId: number;
}
export class SearchCandidate {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
}
export class FilterOption
{
    id:number;
    name:string;
}
export const OrderTypeOptionsForReport = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder, name: 'Re-Order' },
  { id: OrderType.Traveler, name: 'Traveler' },
];
export class CommonCredentialSearchFilter {
  searchText: string;
  businessUnitIds: number[] | null;
}
export class SearchCredential {
  id: number;
  name: string;
  expireDateApplicable: boolean;
  credentialTypeId: number;
  credentialTypeName: string;
}
export class AgencyCommonReportFilter {
  businessUnitIds: number[];
}


