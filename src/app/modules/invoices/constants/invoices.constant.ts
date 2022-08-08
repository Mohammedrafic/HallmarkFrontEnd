import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import {
  AllInvoicesTableColumns,
  InvoiceFilterColumns,
  InvoicePage,
} from '../interfaces';
import { FilteringOptionsFields, TableColumnAlign } from '../../timesheets/enums';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';

export const INVOICES_TAB_CONFIG: TabsListConfig[] = [
  {
    title: 'Invoice Records',
  },
  {
    title: 'All Invoices'
  },
  {
    title: 'Pending Approval'
  },
  {
    title: 'Pending Payment',
  },
  {
    title: 'Paid',
  }
];

// export const MOK_CHILDREN_ITEMS: InvoiceItem[] = [
//   {
//     candidate: 'Sanders, Paul',
//     amount: 1400,
//     startDate: '2022-07-01T12:12:00',
//     minRate: 50,
//     maxRate: 50,
//     timesheetId: '12345',
//   },
//   {
//     candidate: 'Paul, Sanders',
//     amount: 1600,
//     startDate: '2022-07-01T12:12:00',
//     minRate: 40,
//     maxRate: 50,
//     timesheetId: '12346',
//   },
//   {
//     candidate: 'Sanders, Paul',
//     amount: 1430,
//     startDate: '2022-07-03T12:12:00',
//     minRate: 20,
//     maxRate: 50,
//     timesheetId: '12347',
//   }
// ];

// export const MOK_ALL_INVOICES_ITEMS = [
//   {
//     id: '20-30-01',
//     statusText: INVOICES_STATUSES.SUBMITED_PEND_APPR,
//     amount: 5000,
//     type: 'Interface',
//     organization: 'AB Staffing',
//     location: 'Thone - Johnson Memorial Hospital',
//     department: 'Emergency Department 1',
//     candidate: 'Adkis, Adele Blue',
//     issueDate: '2022-07-01T15:00:00',
//     dueDate: '2022-07-20T12:00:00',
//     invoices: MOK_CHILDREN_ITEMS,
//   },
//   {
//     id: '20-30-01',
//     statusText: INVOICES_STATUSES.PENDING_APPROVAL,
//     amount: 5000,
//     type: 'Interface',
//     organization: 'AB Staffing',
//     location: 'Thone - Johnson Memorial Hospital',
//     department: 'Emergency Department 1',
//     candidate: 'Adkis, Adele Blue',
//     issueDate: '2022-07-01T15:00:00',
//     dueDate: '2022-07-20T12:00:00'
//   },
//   {
//     id: '20-30-01',
//     statusText: INVOICES_STATUSES.PENDING_PAYMENT,
//     amount: 5000,
//     type: 'Interface',
//     organization: 'AB Staffing',
//     location: 'Thone - Johnson Memorial Hospital',
//     department: 'Emergency Department 1',
//     candidate: 'Adkis, Adele Blue',
//     issueDate: '2022-07-01T15:00:00',
//     dueDate: '2022-07-20T12:00:00'
//   },
// ];

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
