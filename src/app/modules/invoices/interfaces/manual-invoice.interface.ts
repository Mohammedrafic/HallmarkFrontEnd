import { InvoiceAttachment } from './invoice-attachment.interface';
import { InvoiceRecordType } from '../enums';
import { PageOfCollections } from '@shared/models/page.model';
import { BaseInvoice } from './base-invoice.interface';

export type ManualInvoicesData = PageOfCollections<ManualInvoice>;

export interface ManualInvoice extends BaseInvoice {
  amount: number;
  attachments: InvoiceAttachment[];
  comment: string | null;

  formattedOrderId: string;
  formattedOrderIdFull: string;
  positionId: number;

  invoiceRecordType: InvoiceRecordType;
  invoiceRecordTypeText: string;
  jobId: number;

  reasonCode: string;
  reasonId: number;
  rejectionReason: string | null;
  vendorFeeApplicable: boolean;
  weekEndDate: string;
  weekNumber: number;
  weekStartDate: string;
  serviceDate: string;
  linkedInvoiceId: string | null;
  orderPublicId: number;
}
