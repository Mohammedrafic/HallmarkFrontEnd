import { TimeSpan } from './../../../modules/invoices/interfaces/pending-invoice-record.interface';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderType } from '@shared/enums/order-type';

export class CommonReportFilterOptions {
  orderStatuses: OrderStatusDto[];
  jobStatuses: JobStatusDto[];
  candidateStatuses: {
    status: ApplicantStatus;
    statusText: string;
  }[];
  masterSkills: MasterSkillDto[];
  skillCategories: SkillCategoryDto[];
  agencies: AgencyDto[];
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
export class AgencyDto {
  agencyId: number;
  agencyName: string;
}
export class CommonReportFilter {
  businessUnitIds: number[];
}
export class CommonCandidateSearchFilter {
  searchText: string;
  businessUnitIds: number[] | null;
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
    Id:number;
    Name:string;
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

export class MasterShiftDto {
  id: number;
  organizationid?: number;
  name: string;
  startTime: TimeSpan;
  endTime: TimeSpan;
  onCall: boolean;
  onCallText: string;
}

export class workCommitmentDto {
  id: number;
  name: string;
}

export class StaffScheduleReportFilterOptions {
  masterSkills: MasterSkillDto[];
  masterShifts: MasterShiftDto[];
  masterWorkCommitments: workCommitmentDto[];
}
