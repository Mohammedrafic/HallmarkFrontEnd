import { PageOfCollections } from "@shared/models/page.model";

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
}

export type RejectReasonPayload = {
  organizationId: number;
  jobId: number;
  rejectReasonId: number;
}

export type RejectReasonPage = PageOfCollections<RejectReason>;

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

