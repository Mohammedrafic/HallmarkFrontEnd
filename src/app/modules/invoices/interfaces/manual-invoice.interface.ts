import { InvoiceAttachment } from './invoice-attachment.interface';
import { InvoiceRecordType } from '../enums';
import { PageOfCollections } from '@shared/models/page.model';
import { BaseInvoice } from './base-invoice.interface';
import { AgencyStatus } from '@shared/enums/status';

export type ManualInvoicesData = PageOfCollections<ManualInvoice>;

export interface ManualInvoice extends BaseInvoice {
  amount: number;
  attachments: InvoiceAttachment[];
  comment: string | null;
  agencyStatus: AgencyStatus;
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
