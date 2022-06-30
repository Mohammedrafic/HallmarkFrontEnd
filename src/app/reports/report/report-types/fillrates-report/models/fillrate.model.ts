import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrderType } from '@shared/enums/order-type';

export interface FillrateModel {
  actualEndDate: string;
  actualStartDate: string;
  agency: string;
  agencyId: number;
  badgeId: number | null;
  candidate: string;
  candidateStatus: ApplicantStatus | null;
  candidateStatusText: string;
  daysOrderStartToActualStartDate: number;
  department: string;
  departmentId: number | null;
  jobClassification: number | null;
  jobClassificationText: string;
  jobId: number | null;
  jobStatus: string;
  jobTitle: string;
  location: string;
  locationId: number | null;
  ltaOrderNumber: number | null;
  onboardDate: string | null;
  orderEndDate: string;
  orderStartDate: string;
  orderType: OrderType;
  orderTypeText: string;
  reason: string | null;
  reasonCode: number | null;
  region: string;
  rejectedDate: string | null;
  skill: string | null;
}
