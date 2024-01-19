import { Attachment } from '@shared/components/attachments';
import { AgencyStatus } from '@shared/enums/status';
import { PageOfCollections } from '@shared/models/page.model';
import { InvoiceRecordType } from '../enums';
import { InvoiceType } from '../enums/invoice-type.enum';
import { BaseInvoice, InvoiceAttachment } from './invoice.interface';

export type PendingInvoicesData = PageOfCollections<PendingInvoice>;

export interface PendingInvoice extends BaseInvoice {
  timesheetType: InvoiceType;
  timesheetTypeText: string;
  agencyStatus: AgencyStatus;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  rejectionReason: string | null;
  invoiceRecords: PendingInvoiceRecord[];
  invoiceIdData:PendingInvoiceRecord[];
  attachments: Attachment[];
  rate: number | null;
  bonus: number | null;
  expenses: number | null;
  hours: number | null;
  miles: number | null;
  amount: number;
  isBasedOnPdTimesheet: boolean;
}

export interface PendingInvoiceRecord {
  id: number;
  invoiceRecordType: InvoiceRecordType;
  invoiceRecordTypeText: string;
  dateTime: string;
  billRateConfigId: number;
  billRateConfigTitle: string;
  timeIn: TimeSpan;
  timeOut: TimeSpan;
  vendorFeeApplicable: boolean;
  comment: string;
  reasonId: number;
  reasonCode: string;
  linkedInvoiceId: number;
  rate: number;
  value: number;
  total: number;
  timesheetId: number;
  attachments: InvoiceAttachment[];
  timesheetRecordId: number;
  timesheetType?: number;
  reorderCandidatePosition: string;
}

export interface TimeSpan {
  ticks: number;
  days: number;
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMilliseconds: number;
  totalMinutes: number;
  totalSeconds: number;
}
