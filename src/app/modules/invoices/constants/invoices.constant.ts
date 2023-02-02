import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { InvoiceFilterColumns, InvoiceFilterFieldConfig, InvoicesTabItem, InvoiceTabId } from '../interfaces';
import {
  FilteringInvoicesOptionsFields,
  FilteringPendingInvoiceRecordsOptionsFields,
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

const defaultDateMapping = {
  type: ControlTypes.Date,
  valueType: ValueType.Text,
};

export const InvoiceDefaultFilterColumns: InvoiceFilterColumns = {
  [InvoicesTableFiltersColumns.FormattedInvoiceIds]: defaultInputMapping,
  [InvoicesTableFiltersColumns.SearchTerm]: defaultInputMapping,
  [InvoicesTableFiltersColumns.StatusIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AmountFrom]: defaultInputMapping,
  [InvoicesTableFiltersColumns.AmountTo]: defaultInputMapping,
  [InvoicesTableFiltersColumns.ApDelivery]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AggregateByType]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AgencyIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.IssueDateFrom]: defaultDateMapping,
  [InvoicesTableFiltersColumns.IssueDateTo]: defaultDateMapping,
  [InvoicesTableFiltersColumns.DueDateFrom]: defaultDateMapping,
  [InvoicesTableFiltersColumns.DueDateTo]: defaultDateMapping,
  [InvoicesTableFiltersColumns.PaidDateFrom]: defaultDateMapping,
  [InvoicesTableFiltersColumns.PaidDateTo]: defaultDateMapping,

  [InvoicesTableFiltersColumns.OrderIds]: defaultInputMapping,
  [InvoicesTableFiltersColumns.TimesheetType]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.RegionIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.LocationIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DepartmentIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.SkillIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.WeekPeriodFrom]: defaultDateMapping,
  [InvoicesTableFiltersColumns.WeekPeriodTo]: defaultDateMapping,
} as InvoiceFilterColumns;

export const InvoicesFilteringOptionsMapping: Map<FilteringInvoicesOptionsFields, InvoicesTableFiltersColumns> = new Map()
  .set(FilteringInvoicesOptionsFields.Agency, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringInvoicesOptionsFields.AggregateByType, InvoicesTableFiltersColumns.AggregateByType)
  .set(FilteringInvoicesOptionsFields.ApDelivery, InvoicesTableFiltersColumns.ApDelivery)
  .set(FilteringInvoicesOptionsFields.InvoiceStates, InvoicesTableFiltersColumns.StatusIds);

export const PendingInvoiceRecordsFilteringOptionsMapping: Map<FilteringPendingInvoiceRecordsOptionsFields,
InvoicesTableFiltersColumns> = new Map()
  .set(FilteringPendingInvoiceRecordsOptionsFields.Types, InvoicesTableFiltersColumns.TimesheetType)
  .set(FilteringPendingInvoiceRecordsOptionsFields.Skills, InvoicesTableFiltersColumns.SkillIds)
  .set(FilteringPendingInvoiceRecordsOptionsFields.Agency, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringPendingInvoiceRecordsOptionsFields.Regions, InvoicesTableFiltersColumns.RegionIds)
  .set(FilteringPendingInvoiceRecordsOptionsFields.Locations, InvoicesTableFiltersColumns.LocationIds)
  .set(FilteringPendingInvoiceRecordsOptionsFields.Departments, InvoicesTableFiltersColumns.DepartmentIds);

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
    title: 'Candidate Name',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
  ...(selectedTabId === InvoicesOrgTabId.AllInvoices || isAgency && InvoicesAgencyTabId.AllInvoices ? [{
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
    showSelectAll: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Group By Type',
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

export const PendingInvoicesFiltersFormConfig = (): InvoiceFilterFieldConfig[] => [
  {
    type: ControlTypes.Dropdown,
    title: 'Type',
    field: InvoicesTableFiltersColumns.TimesheetType,
  },
  {
    type: ControlTypes.Text,
    title: 'Order ID/Position ID',
    field: InvoicesTableFiltersColumns.OrderIds,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Agency',
    field: InvoicesTableFiltersColumns.AgencyIds,
  },
  {
    type: ControlTypes.Text,
    title: 'Candidate',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Region',
    field: InvoicesTableFiltersColumns.RegionIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Location',
    field: InvoicesTableFiltersColumns.LocationIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Department',
    field: InvoicesTableFiltersColumns.DepartmentIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Skill',
    field: InvoicesTableFiltersColumns.SkillIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Week Period From',
    field: InvoicesTableFiltersColumns.WeekPeriodFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Week Period To',
    field: InvoicesTableFiltersColumns.WeekPeriodTo,
    isShort: true,
  },
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
];

export const DetectFormConfigBySelectedType = (selectedTabId: InvoiceTabId,
  isAgency: boolean): InvoiceFilterFieldConfig[] => {
  if (
    selectedTabId !== InvoicesAgencyTabId.ManualInvoicePending
    && selectedTabId !== InvoicesOrgTabId.PendingInvoiceRecords
    && selectedTabId !== InvoicesOrgTabId.ManualInvoicePending
  ) {
    return AllInvoicesFiltersFormConfig(isAgency, selectedTabId);
  }

  if (selectedTabId === InvoicesOrgTabId.PendingInvoiceRecords) {
    return PendingInvoicesFiltersFormConfig();
  }

  return ManualInvoicesFiltersFormConfig();
};
