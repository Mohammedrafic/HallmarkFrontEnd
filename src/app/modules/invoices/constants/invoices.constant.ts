import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { InvoiceFilterColumns, InvoiceFilterFieldConfig, InvoicesTabItem, InvoiceTabId } from '../interfaces';
import {
  FilteringInvoicesOptionsFields, FilteringManualPendingInvoiceRecordsOptionsFields,
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

const defaultDropdownColumnMapping = {
  type: ControlTypes.Dropdown,
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

  [InvoicesTableFiltersColumns.OrderId]: defaultInputMapping,
  [InvoicesTableFiltersColumns.ServiceDateFrom]: defaultDateMapping,
  [InvoicesTableFiltersColumns.ServiceDateTo]: defaultDateMapping,
  [InvoicesTableFiltersColumns.VendorFee]: defaultDropdownColumnMapping,
  [InvoicesTableFiltersColumns.ReasonCodeIds]: defaultColumnMapping,
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
  .set(FilteringPendingInvoiceRecordsOptionsFields.Departments, InvoicesTableFiltersColumns.DepartmentIds)
  .set(FilteringInvoicesOptionsFields.InvoiceStates, InvoicesTableFiltersColumns.StatusIds);

export const ManualPendingInvoiceRecordsFilteringOptionsMapping: Map<FilteringManualPendingInvoiceRecordsOptionsFields,
  InvoicesTableFiltersColumns> = new Map()
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.InvoiceStates, InvoicesTableFiltersColumns.StatusIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Agency, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Reasons, InvoicesTableFiltersColumns.ReasonCodeIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.VendorFee, InvoicesTableFiltersColumns.VendorFee)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Regions, InvoicesTableFiltersColumns.RegionIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Locations, InvoicesTableFiltersColumns.LocationIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Departments, InvoicesTableFiltersColumns.DepartmentIds)
  .set(FilteringManualPendingInvoiceRecordsOptionsFields.Skills, InvoicesTableFiltersColumns.SkillIds)

export const ApproveInvoiceConfirmDialogConfig = {
  title: 'Approve Invoice',
  submitButtonText: 'Approve',
  getMessage: (invoiceId: number) => `Are you sure you want to approve invoice ${invoiceId}?`,
};

export const ManualInvoicesFiltersFormConfig = (isAgency: boolean): InvoiceFilterFieldConfig[] => [
  {
    type: ControlTypes.Multiselect,
    title: 'Status',
    field: InvoicesTableFiltersColumns.StatusIds,
  },
  ...(!isAgency ? [{
    type: ControlTypes.Multiselect,
    title: 'Agency',
    field: InvoicesTableFiltersColumns.AgencyIds,
  }] : []),
  {
    type: ControlTypes.Text,
    title: 'Candidate Name',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
  {
    type: ControlTypes.Text,
    title: 'Order ID',
    field: InvoicesTableFiltersColumns.OrderId,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Region',
    field: InvoicesTableFiltersColumns.RegionIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location',
    field: InvoicesTableFiltersColumns.LocationIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Department',
    field: InvoicesTableFiltersColumns.DepartmentIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Skill',
    field: InvoicesTableFiltersColumns.SkillIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Service Date From',
    field: InvoicesTableFiltersColumns.ServiceDateFrom,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Service Date To',
    field: InvoicesTableFiltersColumns.ServiceDateTo,
    isShort: true,
  },
  {
    type: ControlTypes.Dropdown,
    title: 'Vendor Fee',
    field: InvoicesTableFiltersColumns.VendorFee,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Reason Code',
    field: InvoicesTableFiltersColumns.ReasonCodeIds,
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
    type: ControlTypes.Multiselect,
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
    type: ControlTypes.Multiselect,
    title: 'AP Delivery',
    field: InvoicesTableFiltersColumns.ApDelivery,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Group By Type',
    field: InvoicesTableFiltersColumns.AggregateByType,
  },
  ...(!isAgency ? [{
    type: ControlTypes.Multiselect,
    title: 'Agency',
    field: InvoicesTableFiltersColumns.AgencyIds,
  }] : []),
  {
    type: ControlTypes.Multiselect,
    title: 'Region',
    field: InvoicesTableFiltersColumns.RegionIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location',
    field: InvoicesTableFiltersColumns.LocationIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Department',
    field: InvoicesTableFiltersColumns.DepartmentIds,
    isShort: false,
    showSelectAll: true,
  },
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
    type: ControlTypes.Multiselect,
    title: 'Type',
    field: InvoicesTableFiltersColumns.TimesheetType,
  },
  {
    type: ControlTypes.Text,
    title: 'Order ID/Position ID',
    field: InvoicesTableFiltersColumns.OrderIds,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Agency',
    field: InvoicesTableFiltersColumns.AgencyIds,
  },
  {
    type: ControlTypes.Text,
    title: 'Candidate',
    field: InvoicesTableFiltersColumns.SearchTerm,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Region',
    field: InvoicesTableFiltersColumns.RegionIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location',
    field: InvoicesTableFiltersColumns.LocationIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Department',
    field: InvoicesTableFiltersColumns.DepartmentIds,
    isShort: true,
    showSelectAll: true,
  },
  {
    type: ControlTypes.Multiselect,
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
  return ManualInvoicesFiltersFormConfig(isAgency);
};
