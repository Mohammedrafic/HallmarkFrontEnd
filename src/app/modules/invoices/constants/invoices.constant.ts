import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import {
  InvoiceFilterColumns,
  InvoiceFilterFieldConfig,
  InvoicesTabItem,
  InvoiceTabId,
} from '../interfaces';
import {
  FilteringInvoicesOptionsFields,
  InvoicesAgencyTabId,
  InvoicesOrgTabId,
  InvoicesTableFiltersColumns,
} from '../enums';

export const AGENCY_INVOICE_TABS: InvoicesTabItem[] = [
  {
    title: 'Manual Invoice Pending',
    tabId: InvoicesAgencyTabId.ManualInvoicePending,
  },
  {
    title: 'All Invoices',
    tabId: InvoicesAgencyTabId.AllInvoices,
  },
];

export const ORGANIZATION_INVOICE_TABS: InvoicesTabItem[] = [
  {
    title: 'Pending Invoice Records',
    tabId: InvoicesOrgTabId.PendingInvoiceRecords,
  },
  {
    title: 'Manual Invoice Pending',
    tabId: InvoicesOrgTabId.ManualInvoicePending,
  },
  {
    title: 'Pending Approval',
    tabId: InvoicesOrgTabId.PendingApproval,
  },
  {
    title: 'Pending Payment',
    tabId: InvoicesOrgTabId.PendingPayment,
  },
  {
    title: 'Paid',
    tabId: InvoicesOrgTabId.Paid,
  },
  {
    title: 'All Invoices',
    tabId: InvoicesOrgTabId.AllInvoices,
  },
];

// TODO: Rename, move to core module
export const DEFAULT_ALL_INVOICES = {
  items: [],
  pageNumber: 1,
  totalCount: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const SavedInvoicesFiltersParams: InvoicesTableFiltersColumns[] = [
  InvoicesTableFiltersColumns.PageNumber,
  InvoicesTableFiltersColumns.PageSize,
  InvoicesTableFiltersColumns.OrderBy,
  InvoicesTableFiltersColumns.StatusIds,
];


const defaultInputMapping = {
  type: ControlTypes.Text,
  valueType: ValueType.Text,
};

const defaultColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

export const InvoiceDefaultFilterColumns: InvoiceFilterColumns = {
  [InvoicesTableFiltersColumns.FormattedInvoiceIds]: defaultInputMapping,
  [InvoicesTableFiltersColumns.SearchTerm]: defaultInputMapping,
  [InvoicesTableFiltersColumns.StatusIds]: defaultInputMapping,
  [InvoicesTableFiltersColumns.AmountFrom]: defaultInputMapping,
  [InvoicesTableFiltersColumns.AmountTo]: defaultInputMapping,
  [InvoicesTableFiltersColumns.ApDelivery]: defaultInputMapping,
  [InvoicesTableFiltersColumns.AggregateByType]: defaultInputMapping,
  [InvoicesTableFiltersColumns.AgencyIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.IssueDateFrom]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.IssueDateTo]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DueDateFrom]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DueDateTo]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.PaidDateFrom]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.PaidDateTo]: defaultColumnMapping,
} as InvoiceFilterColumns;

export const InvoicesFilteringOptionsMapping: Map<FilteringInvoicesOptionsFields, InvoicesTableFiltersColumns> = new Map()
  .set(FilteringInvoicesOptionsFields.Agency, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringInvoicesOptionsFields.AggregateByType, InvoicesTableFiltersColumns.AggregateByType)
  .set(FilteringInvoicesOptionsFields.ApDelivery, InvoicesTableFiltersColumns.ApDelivery)
  .set(FilteringInvoicesOptionsFields.InvoiceStates, InvoicesTableFiltersColumns.StatusIds);

export const ApproveInvoiceConfirmDialogConfig = {
  title: 'Approve Invoice',
  submitButtonText: 'Approve',
  getMessage: (invoiceId: number) => `Are you sure you want to approve invoice ${invoiceId}?`,
};

export const ManualInvoicesFiltersFormConfig = (): InvoiceFilterFieldConfig[] => [
  {
    type: ControlTypes.Text,
    title: 'Candidate name',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
];

export const AllInvoicesFiltersFormConfig = (isAgency: boolean, selectedTabId: InvoiceTabId): InvoiceFilterFieldConfig[] => [
  {
    type: ControlTypes.Text,
    title: 'Invoice ID',
    field: InvoicesTableFiltersColumns.FormattedInvoiceIds,
  },
  {
    type: ControlTypes.Text,
    title: 'Candidate name',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
  ...(selectedTabId === InvoicesOrgTabId.AllInvoices ? [{
    type: ControlTypes.Dropdown,
    title: 'Status',
    field: InvoicesTableFiltersColumns.StatusIds,
  }]: []),
  {
    type: ControlTypes.Text,
    title: 'Amount From',
    field: InvoicesTableFiltersColumns.AmountFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Text,
    title: 'Amount To',
    field: InvoicesTableFiltersColumns.AmountTo,
    isShort: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'AP Delivery',
    field: InvoicesTableFiltersColumns.ApDelivery,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Group by Type',
    field: InvoicesTableFiltersColumns.AggregateByType,
  },
  ...(!isAgency ? [{
    type: ControlTypes.Dropdown,
    title: 'Agency',
    field: InvoicesTableFiltersColumns.AgencyIds,
  }] : []),
  {
    type: ControlTypes.Date,
    title: 'Issued Date From',
    field: InvoicesTableFiltersColumns.IssueDateFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Issued Date To',
    field: InvoicesTableFiltersColumns.IssueDateTo,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Due Date From',
    field: InvoicesTableFiltersColumns.DueDateFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Due Date To',
    field: InvoicesTableFiltersColumns.DueDateTo,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Paid Date From',
    field: InvoicesTableFiltersColumns.PaidDateFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Paid Date To',
    field: InvoicesTableFiltersColumns.PaidDateTo,
    isShort: true,
  },
];

export const DetectFormConfigBySelectedType = (selectedTabId: InvoiceTabId, isAgency: boolean): InvoiceFilterFieldConfig[] => {
  if (
    selectedTabId !== InvoicesAgencyTabId.ManualInvoicePending
    && selectedTabId !== InvoicesOrgTabId.PendingInvoiceRecords
    && selectedTabId !== InvoicesOrgTabId.ManualInvoicePending
  ) {
    return AllInvoicesFiltersFormConfig(isAgency, selectedTabId);
  }

  return ManualInvoicesFiltersFormConfig();
};
