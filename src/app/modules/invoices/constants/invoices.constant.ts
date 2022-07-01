import { TabsListConfig } from '@shared/components/tabs-list/tabs-list-config.model';
import { AllInvoicesTable, Invoice, InvoicePage } from '../interfaces';
import { INVOICES_STATUSES } from '../enums/invoices.enum';
import { TableColumnAlign } from '../../timesheets/enums';

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
    title: 'Pending',
    amount: 2,
  },
  {
    title: 'Paid',
  }
];

export const MOK_CHILDREN_ITEMS = [
  {
    name: 'Sanders, Paul',
    amount: 1400,
    workWeek: '2022-07-01T12:12:00',
    billRate: '10.00 - 25.00',
    timesheetId: '12345',
  },
  {
    name: 'Paul, Sanders',
    amount: 1600,
    workWeek: '2022-07-01T12:12:00',
    billRate: '16.00 - 25.00',
    timesheetId: '12346',
  },
  {
    name: 'Sanders, Paul',
    amount: 1430,
    workWeek: '2022-07-03T12:12:00',
    billRate: '09.00 - 25.00',
    timesheetId: '12347',
  }
];

export const MOK_ALL_INVOICES_ITEMS = [
  {
    id: '20-30-01',
    statusText: INVOICES_STATUSES.SUBMITED_PEND_APPR,
    amount: 5000,
    type: 'Interfaced',
    organization: 'AB Staffing',
    location: 'Thone - Johnson Memorial Hospital',
    department: 'Emergency Department 1',
    candidate: 'Adkis, Adele Blue',
    issueDate: new Date(),
    dueDate: new Date(),
    children: MOK_CHILDREN_ITEMS,
    groupBy: '',
    groupName: '',
  },
  {
    id: '20-30-01',
    statusText: INVOICES_STATUSES.PENDING_APPROVAL,
    amount: 5000,
    type: 'Interfaced',
    organization: 'AB Staffing',
    location: 'Thone - Johnson Memorial Hospital',
    department: 'Emergency Department 1',
    candidate: 'Adkis, Adele Blue',
    issueDate: new Date(),
    dueDate: new Date(),
    groupBy: '',
    groupName: '',
  },
  {
    id: '20-30-01',
    statusText: INVOICES_STATUSES.PENDING_PAYMENT,
    amount: 5000,
    type: 'Interfaced',
    organization: 'AB Staffing',
    location: 'Thone - Johnson Memorial Hospital',
    department: 'Emergency Department 1',
    candidate: 'Adkis, Adele Blue',
    issueDate: new Date(),
    dueDate: new Date(),
    groupBy: '',
    groupName: '',
  },
] as unknown as Invoice[];

export const MOK_ALL_INVOICES_PAGE: InvoicePage = {
  items: MOK_ALL_INVOICES_ITEMS,
  pageNumber: 1,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const AllInvoicesTableConfig: AllInvoicesTable = {
  invoiceId: {
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
  issueDate: {
    align: TableColumnAlign.Left,
    width: 234,
    header: 'Issue Date',
  },
  dueDate: {
    align: TableColumnAlign.Right,
    width: 140,
    header: 'Due Date',
  },
}
