import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import {
  AllInvoicesTableColumns,
  InvoiceFilterColumns,
  InvoicePage,
} from '../interfaces';
import { FilteringOptionsFields, TableColumnAlign } from '../../timesheets/enums';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';

export const AGENCY_INVOICE_TABS: TabsListConfig[] = [
  {
    title: 'Manual Invoice Pending'
  },
  {
    title: 'All Invoices',
  }
];

export const ORGANIZATION_INVOICE_TABS: TabsListConfig[] = [
  {
    title: 'Manual Invoice Pending'
  },
  {
    title: 'Pending Invoice Records'
  },
  {
    title: 'Pending Approval'
  },
  {
    title: 'Pending Payment',
  },
  {
    title: 'Paid',
  },
  {
    title: 'All Invoices'
  },
];

export const DEFAULT_ALL_INVOICES: InvoicePage = {
  items: [],
  pageNumber: 1,
  totalCount: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const AllInvoicesTableConfig: AllInvoicesTableColumns = {
  id: {
    align: TableColumnAlign.Left,
    width: 158,
    header: 'Invoice Id',
  },
  statusText: {
    align: TableColumnAlign.Left,
    width: 220,
    header: 'Status',
  },
  amount: {
    align: TableColumnAlign.Right,
    width: 140,
    header: 'Amount',
  },
  type: {
    align: TableColumnAlign.Left,
    width: 124,
    header: 'Type',
  },
  organization: {
    align: TableColumnAlign.Left,
    width: 164,
    header: 'Organization',
  },
  location: {
    align: TableColumnAlign.Left,
    width: 167,
    header: 'Location',
  },
  department: {
    align: TableColumnAlign.Left,
    width: 184,
    header: 'Department',
  },
  candidate: {
    align: TableColumnAlign.Left,
    width: 184,
    header: 'Candidate',
  },
  issuedDate: {
    align: TableColumnAlign.Left,
    width: 234,
    header: 'Issue Date',
  },
  dueDate: {
    align: TableColumnAlign.Right,
    width: 140,
    header: 'Due Date',
  },
};

export const invoicesFilterOptionFields = {
  text: 'name',
  value: 'id'
};

const defaultColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

export const InvoiceDefaultFilterColumns: InvoiceFilterColumns = {
  [InvoicesTableFiltersColumns.OrderIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.SkillIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DepartmentIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AgencyIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.RegionsIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.LocationIds]: defaultColumnMapping,
} as InvoiceFilterColumns;


export const InvoicesFilteringOptionsMapping: Map<FilteringOptionsFields, InvoicesTableFiltersColumns> = new Map()
  .set(FilteringOptionsFields.Agencies, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringOptionsFields.Orders, InvoicesTableFiltersColumns.OrderIds)
  .set(FilteringOptionsFields.Regions, InvoicesTableFiltersColumns.RegionsIds)
  .set(FilteringOptionsFields.Skills, InvoicesTableFiltersColumns.SkillIds);
