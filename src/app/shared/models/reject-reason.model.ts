import { PageOfCollections } from "@shared/models/page.model";

export type RejectReason = {
  id: number;
  reason: string;
  businessUnitId?: number;
}

export type RejectReasonPayload = {
  organizationId: number;
  jobId: number;
  rejectReasonId: number;
}

export type RejectReasonPage = PageOfCollections<RejectReason>;
