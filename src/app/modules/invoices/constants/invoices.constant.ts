import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { InvoiceFilterColumns, InvoicesTabItem } from '../interfaces';
import { InvoicesTableFiltersColumns } from '../enums';

export const AGENCY_INVOICE_TABS: InvoicesTabItem[] = [
  {
    title: 'Manual Invoice Pending',
  },
  {
    title: 'All Invoices',
  },
];

export const ORGANIZATION_INVOICE_TABS: InvoicesTabItem[] = [
  {
    title: 'Pending Invoice Records',
  },
  {
    title: 'Manual Invoice Pending',
  },
  {
    title: 'Pending Approval',
  },
  {
    title: 'Pending Payment',
  },
  {
    title: 'Paid',
  },
  {
    title: 'All Invoices',
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

export enum FilteringInvoicesOptionsFields {
  Agencies = 'agencies',
  Orders = 'orders',
  Regions = 'regions',
  Skills = 'skills',
  Statuses = 'statuses'
}

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
  [InvoicesTableFiltersColumns.SearchTerm]: defaultInputMapping,
  [InvoicesTableFiltersColumns.OrderIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.SkillIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DepartmentIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AgencyIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.RegionsIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.LocationIds]: defaultColumnMapping,
} as InvoiceFilterColumns;


export const InvoicesFilteringOptionsMapping: Map<FilteringInvoicesOptionsFields, InvoicesTableFiltersColumns> = new Map()
  .set(FilteringInvoicesOptionsFields.Agencies, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringInvoicesOptionsFields.Orders, InvoicesTableFiltersColumns.OrderIds)
  .set(FilteringInvoicesOptionsFields.Regions, InvoicesTableFiltersColumns.RegionsIds)
  .set(FilteringInvoicesOptionsFields.Skills, InvoicesTableFiltersColumns.SkillIds);


export const ApproveInvoiceConfirmDialogConfig = {
  title: 'Approve Invoice',
  submitButtonText: 'Approve',
  getMessage: (invoiceId: number) => `Are you sure you want to approve invoice ${invoiceId}?`,
};