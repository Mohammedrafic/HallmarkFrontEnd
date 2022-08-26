import { InvoicesAggregationType } from '../enums';

export interface GroupInvoicesParams {
  organizationId: number | null;
  aggregateByType: InvoicesAggregationType;
  invoiceRecordIds: number[];
}
