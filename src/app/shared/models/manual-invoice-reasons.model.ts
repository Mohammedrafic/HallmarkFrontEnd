import { PageOfCollections } from "@shared/models/page.model";

export type ManualInvoiceReason = {
  id: number;
  reason: string;
  agencyFeeApplicable?: boolean;
  businessUnitId?: number;
}

export type ManualInvoiceReasonPage = PageOfCollections<ManualInvoiceReason>;
