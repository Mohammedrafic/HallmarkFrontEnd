import { CandidateProfileContactDetail } from "./candidate.model";
import {BillRate} from '@shared/models/bill-rate.model';

export type OrderApplicantsInitialData = {
  candidateId: number;
  orderId: number;
  organizationId: number;
  jobStartDate: string;
  jobEndDate: string;
  orderBillRate: number;
  locationId: number;
  locationName: string;
  departmentId: number;
  departmentName: string;
  availableStartDate: string;
  yearsOfExperience: number;
  expAsTravelers?: number;
  requestComment?: string;
  skill?: string;
  candidatePayRate: string | null;
  canApplyCandidatesToOrder: boolean;
  ssn: number;
  candidateSSNRequired: boolean;
  candidateProfileContactDetails:CandidateProfileContactDetail;
  candidatePhone1Required:any;
  candidateAddressRequired:any;
  billRates: BillRate[];
  isLocal: boolean;
}

export type OrderApplicantsApplyData = {
  orderId: number;
  organizationId: number;
  candidateId: number;
  candidateBillRate?: number;
  expAsTravelers?: number;
  availableStartDate?: string;
  requestComment?: string;
  candidatePayRate: string | null;
}
