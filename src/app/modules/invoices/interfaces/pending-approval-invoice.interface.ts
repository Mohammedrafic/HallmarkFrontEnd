import { InvoiceType } from '../enums/invoice-type.enum';
import { PageOfCollections } from '@shared/models/page.model';
/**
 * Rename this type as it used for different invoices state
 */
export type PendingApprovalInvoicesData = PageOfCollections<PendingApprovalInvoice>;

export interface PendingApprovalInvoice {
  aggregateByType: number;
  aggregateByTypeText: string;
  amount: number;
  apDelivery: number;
  apDeliveryText: string;
  dueDate: string;
  formattedInvoiceId: string;
  invoiceId: number;
  invoiceRecords: PendingApprovalInvoiceRecord[];
  invoiceState: number;
  invoiceStateText: string;
  issuedDate: string;
  organizationId: number;
  amountToPay: number;
  agencySuffix?: number;
}

export interface PendingApprovalInvoiceRecord {
  amount: number;
  candidateFirstName: string;
  candidateId: number;
  candidateLastName: string;
  candidateMiddleName: string | null;
  dateTimeIn: string;
  dateTimeOut: string;
  departmentId: number;
  departmentName: string;
  id: number;
  locationId: number;
  locationName: string;
  regionId: number;
  regionName: string;
  timesheetType: InvoiceType;
  timesheetTypeText: string;
  value: number;
  weekNumber: number;
  dateTime: string;
  billRate: number;
  agencyName: string;
  costCenterFormattedName: string;
  extDepartmentId: string;
  reasonCode: string;
}
