import { PageOfCollections } from '@shared/models/page.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DataSourceItem } from '@core/interface';

import { DetailsColumnConfig } from '../../timesheets/interface';
import { InvoiceRecord } from './invoice-record.model';
import { INVOICES_STATUSES, InvoicesTableFiltersColumns } from '../enums';
import { InvoiceDetail } from './invoice-detail.interface';
import { PendingApprovalInvoice } from './pending-approval-invoice.interface';
import { FilteringInvoicesOptionsFields } from '../constants';

export interface Invoice extends InvoiceRecord {
  groupBy: string;
  groupName: string;
  id: string;
  amount: number;
  type: 'Timesheet';
  invoices: InvoiceRecord[];
  issuedDate: Date;
  dueDate: Date;
  statusText: INVOICES_STATUSES;
}

export type InvoicePage = PageOfCollections<Invoice>;

export interface AllInvoicesTableColumns {
  id: DetailsColumnConfig;
  statusText: DetailsColumnConfig;
  amount: DetailsColumnConfig;
  type: DetailsColumnConfig;
  organization: DetailsColumnConfig;
  location: DetailsColumnConfig;
  department: DetailsColumnConfig;
  candidate: DetailsColumnConfig;
  issuedDate: DetailsColumnConfig;
  dueDate: DetailsColumnConfig;
}

export interface InvoiceItem {
  candidate: string;
  amount: number;
  startDate: string;
  minRate: number;
  maxRate: number;
  timesheetId: string;
  timesheets?: any[];
}

export interface InvoicesFilterState {
  orderBy?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  orderIds?: string[];
  locationIds?: string[];
  regionsIds?: string[];
  departmentIds?: string[];
  agencyIds?: string[];
  skillIds?: string[];
  organizationId?: number | null;
}

export type InvoiceFilterColumns = {
  [key in InvoicesTableFiltersColumns]: {
    type: ControlTypes;
    valueType: ValueType;
    dataSource?: DataSourceItem[] | any;
    valueField?: string;
    valueId?: string;
  }
}

export type InvoicesFilteringOptions = {
  [key in FilteringInvoicesOptionsFields]: DataSourceItem[];
}

export interface ManualInvoiceTimesheetResponse {
  id: number;
  dateTime: string;
  amount: number;
  departmentId: number;
  organizationId: number;
  comment: string;
  manualInvoiceCreationReasonId: number;
  vendorFeeApplicable: boolean;
  calculationDescription: string,
  timesheetId: number;
  invoiceId: number;
}

export interface InvoiceStateDto {
  invoiceId: number;
  targetState: number;
  organizationId?: number;
}

export interface SelectedInvoiceRow {
  rowIndex: number;
  data?: PendingApprovalInvoice;
}

export interface InvoiceDialogActionPayload {
  dialogState: boolean;
  invoiceDetail: InvoiceDetail | null;
}


export interface InvoicePermissions {
  agencyCanPay: boolean;
}
