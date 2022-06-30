import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

export interface FillrateModel {
  actualEndDate: string;
  actualStartDate: string;
  agency: string;
  agencyId: number;
  badgeId: string;
  candidate: string;
  candidateStatus: ApplicantStatus
  daysOrderStartToActualStartDate: string;
  department: string;
  departmentId: number;
  jobClassification: string;
  jobId: number;
  jobStatus: string;
  jobTitle: string;
  location: string;
  locationId: number;
  ltaOrderNumber: string;
  onboardDate: string;
  orderEndDate: string;
  orderStartDate: string;
  orderType: string;
  reason: string;
  reasonCode: string;
  region: string;
  rejectedDate: string;
  skill: string;
}
