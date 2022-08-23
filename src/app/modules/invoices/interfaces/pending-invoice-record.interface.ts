import { Attachment } from '@shared/components/attachments';
import { PageOfCollections } from '@shared/models/page.model';
import { TimesheetType } from '../enums/timesheet-type.enum';
import { PendingInvoiceStatus } from '../enums/pending-invoice-status.enum';

export type PendingInvoicesData = PageOfCollections<PendingInvoice>;

export interface PendingInvoice {
  id: number;
  agencyName: string;
  agencyId: number;
  timesheetType: TimesheetType;
  pendingInvoiceStatus: PendingInvoiceStatus;
  pendingInvoiceStatusText: string;
  organizationId: number;
  organizationName: string;
  candidateId: number;
  candidateFirstName: string;
  candidateMiddleName: string | null;
  candidateLastName: string;
  orderId: number;
  departmentId: number;
  departmentName: string;
  locationId: number;
  locationName: string;
  regionId: number;
  regionName: string;
  skillId: number;
  skillName: string;
  skillAbbr: string;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  rejectionReason: string | null;
  invoiceRecords: PendingInvoiceRecord[];
  attachments: Attachment[];
  rate: number | null;
  bonus: number | null;
  expenses: number | null;
  hours: number | null;
  miles: number | null;
  amount: number;
}

export interface PendingInvoiceRecord {
  id: number;
  dateTime: string;
  billRateConfigId: number;
  billRateConfigTitle: string;
  timeIn: TimeSpan;
  timeOut: TimeSpan;
  comment: string;
  rate: number;
  value: number;
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
