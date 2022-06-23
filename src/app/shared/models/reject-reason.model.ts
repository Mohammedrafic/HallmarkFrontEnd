import { PageOfCollections } from "@shared/models/page.model";

export type RejectReason = {
  id: number;
  reason: string;
  businessUnitId?: number;
}

export type RejectReasonPage = PageOfCollections<RejectReason>;
