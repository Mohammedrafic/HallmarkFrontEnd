import { AggregateType } from '@syncfusion/ej2-angular-grids';
import { DeliveryType, InvoiceState } from '../enums';

export interface GetPendingApprovalParams {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  organizationId?: number | null,
  invoiceState?: InvoiceState;
  apDelivery?: DeliveryType;
  aggregateByType?: AggregateType;
  invoiceIds?: number[];
}
