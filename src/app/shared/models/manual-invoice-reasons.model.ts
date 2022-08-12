import { PageOfCollections } from "@shared/models/page.model";

export type ManualInvoiceReason = {
  id: number;
  reason: string;
  businessUnitId?: number;
}

export type ManualInvoiceReasonPage = PageOfCollections<ManualInvoiceReason>;
