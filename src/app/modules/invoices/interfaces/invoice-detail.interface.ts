import { InvoiceState } from '../enums';

export interface InvoiceDetail {
  meta: InvoiceDetailMeta;
  invoiceRecords: InvoiceDetailRecord[];
  totals: {
    total: number;
    amount: number;
    amountToPay: number;
    feeTotal: number;
    calculatedTotal: number;
  };
  summary: InvoiceDetailSummary[];
}

export interface InvoiceDetailMeta {
  invoiceNum: string;
  invoiceDate: string;
  paymentTerms: number;
  dueDate: string;
  unitName: string;
  unitAddress: string;
  remitAddress: string;
  aggregateByType: number;
  aggregateByTypeText: string;
  formattedInvoiceNumber: string;
  invoiceId: number;
  invoiceState: number;
  invoiceStateText: string;
  organizationPrefix: string;
  organizationIds: number[];
  agencySuffix?: number;
}

export interface InvoiceDetailRecord {
  weekDate: string;
  timeIn: string;
  timeOut: string;
  billRateConfigId: number;
  billRateConfigName: string;
  locationName: string;
  departmentName: string;
  jobId: number;
  candidateFirstName: string;
  candidateMiddleName: string;
  candidateLastName: string;
  skillName: string;
  agencyName: string;
  value: number;
  rate: number;
  total: number;
  costCenterFormattedName: string;
  extDepartmentId: string;
  formattedJobId: string;
  orderId: number;
  organizationPrefix: string;
  positionId: number;
  weekNumber: number;
  fee: number;
}

export interface InvoiceDetailSummary {
  locationName: string;
  items: InvoiceSummaryItem[];
}

export interface InvoiceSummaryItem {
  departmentName: string;
  skillName: string;
  value: number;
  total: number;
  details: string;
  costCenterFormattedName: string;
  extDepartmentId: string;
  totalFee: number;
}

export interface InvoiceInfoUIItem {
  icon: string;
  value: unknown;
  title: string;
  isHide?: boolean;
  isAmount?: boolean;
}

export interface InvoiceUpdateEmmit {
  invoiceId: number;
  status: InvoiceState;
  organizationId?: number;
}

export interface InvoiceDetailsSettings {
  isActionBtnDisabled: boolean;
  paymentDetailsOpen: boolean;
  addPaymentOpen: boolean;
}

export interface InvoicePaymentData {
  invoiceNumber: string;
  amount: number;
}
