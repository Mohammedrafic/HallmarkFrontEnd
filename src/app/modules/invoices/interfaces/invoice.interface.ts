import { PageOfCollections } from '@shared/models/page.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { DataSourceItem, TypedValueGetterParams } from '@core/interface';

import { Attachment, DetailsColumnConfig } from '../../timesheets/interface';
import { INVOICES_STATUSES, InvoicesTableFiltersColumns, InvoiceState, DeliveryType,
  InvoicesAggregationType, InvoiceAttachmentFileType, InvoiceRecordType } from '../enums';
import { InvoiceDetail } from './invoice-detail.interface';
import { PendingApprovalInvoice, PendingApprovalInvoicesData } from './pending-approval-invoice.interface';
import { FilteringInvoicesOptionsFields } from '../constants';
import { PendingInvoiceStatus } from '../enums/invoice-status.enum';
import { SelectEventArgs, TabItemModel } from '@syncfusion/ej2-angular-navigations';
import { AggregateType } from '@syncfusion/ej2-angular-grids';
import { BillRateType } from '@shared/models';
import { AgencyStatus } from '@shared/enums/status';
import { AttachmentAction } from '@shared/components/attachments';
import { PendingInvoiceRecord } from './pending-invoice-record.interface';
import { ColDef } from '@ag-grid-community/core';

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

export interface AllInvoiceCell {
  approve: () => void;
  pay: () => void;
  canEdit: boolean;
  canPay: boolean;
}

export interface InvoicePermissions {
  agencyCanPay: boolean;
}

export interface BaseInvoice {
  id: number;
  agencyId: number;
  agencyName: string;

  candidateId: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string | null;

  departmentId: number;
  departmentName: string;

  locationId: number;
  locationName: string;

  orderId: number;
  formattedOrderIdFull: string;
  organizationId: number;
  organizationName: string;

  regionId: number;
  regionName: string;

  status: PendingInvoiceStatus;
  statusText: string;

  skillId: number;
  skillName: string;
  skillAbbr: string;
}

export interface InvoicesTabItem extends TabItemModel {
  amount?: number;
  title?: string;
  hidden?: boolean;
}

export interface DropdownSelectArgs<T = unknown> extends Omit<SelectEventArgs, 'itemData'> {
  itemData: T;
}

export interface InvoiceFilterForm {
  searchTerm: string;
  orderIds: string[];
  regionsIds: string[];
  locationIds: string[];
  departmentIds: string[];
  agencyIds: string[];
  skillIds: string[];
}

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

export interface GridContainerTabConfig {
  groupingEnabled: boolean;
  manualInvoiceCreationEnabled: boolean;
}

export type GroupInvoicesBy = keyof Pick<InvoiceRecord, 'location' | 'department'>;

export interface GroupInvoicesParams {
  organizationId: number | null;
  aggregateByType: InvoicesAggregationType;
  invoiceRecordIds: number[];
}

export interface InvoiceAttachment extends Attachment {
  fileType: InvoiceAttachmentFileType;
}

export interface InvoiceRecord {
  type: 'Timesheet' | 'Manual';
  // unitName?
  agency: string;

  candidateFirstName: string;
  candidateLastName: string;
  orderId: number;
  location: string;
  department: string;
  skill: string;
  startDate: string;
  rate: number;
  bonus: number;
  expenses: number;
  hours: number;
  miles: number;
  amount: number;
  timesheetId?: number;
  attachments: Attachment[];
  timesheetRecords: InvoiceRecordTimesheetEntry[];
}

export interface InvoiceRecordTimesheetEntry {
  date: string;
  billRateType: BillRateType;
  timeIn: string;
  timeOut: string;
  rate: number;
  value: number;
  total: number;
  comment: string;
}

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

type InvoiceAttachmentAction = AttachmentAction<InvoiceAttachment>;
export type GetPendingInvoiceDetailsColDefsFn = (config: PendingInvoiceRowDetailsConfig) =>
  TypedColDef<PendingInvoiceRecord>[];

export interface PendingInvoiceRowDetailsConfig {
  previewExpensesAttachment: InvoiceAttachmentAction;
  downloadExpensesAttachment: InvoiceAttachmentAction;

  previewMilesAttachments: (invoiceId: number) => InvoiceAttachmentAction;
  downloadMilesAttachments: (invoiceId: number) => InvoiceAttachmentAction;
}

export type PendingPaymentInvoiceData = PendingApprovalInvoicesData;


interface TypedValueGetterFunc<T> {
  (params: TypedValueGetterParams<T>): unknown;
}

export interface TypedColDef<T> extends ColDef {
  field?: (keyof T & string) | string;
  valueGetter?: string | TypedValueGetterFunc<T>;
}

