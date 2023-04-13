import { PageOfCollections } from "@shared/models/page.model";

export type OrderRequisitionReason = {
  id?: number;
  name: string;
  businessUnitId?: number;
}

export type RejectReason = {
  id?: number;
  reason: string;
  businessUnitId?: number;
}

export type RejectReasonwithSystem = {
  id?: number;
  reason: string;
  businessUnitId?: number;
  includeInVMS?: boolean;
  includeInIRP?: boolean;
  isVMSIRP?:boolean;
}

export type RejectReasonWithRedflag = {
  id?: number;
  reason: string;
  organizationId?: number;
  isRedFlagCategory: boolean;
}

export type RejectReasonPayload = {
  organizationId: number;
  jobId: number;
  rejectReasonId: number;
}

export type RejectReasonPage = PageOfCollections<RejectReasonwithSystem>;

export interface UnavailabilityReasons {
  id: string;
  reason: string;
  calculateTowardsWeeklyHours: boolean;
  eligibleToBeScheduled: boolean;
  visibleForIRPCandidates: boolean;
  organizationId: number;
  description: string;
}

export interface UnavailabilityPaging {
  PageNumber: number;
  PageSize: number;
}

