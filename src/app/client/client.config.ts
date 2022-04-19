import { ClientSidebarMenu } from "../shared/models/client-sidebar-menu.model";
import { ResizeSettingsModel, TextWrapSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

export const CLIENT_SIDEBAR_MENU: ClientSidebarMenu[] = [
  {
    title: 'Dashboard',
    icon: 'home',
    route: '/client/dashboard',
    children: [],
  },
  {
    title: 'Order Management',
    icon: 'file-text',
    route: '/client/order-management/all',
    isActive: true,
    children: [
      {
        title: 'All Orders',
        icon: '',
        route: '/client/order-management/all'
      },
      {
        title: 'Order Templates',
        icon: '',
        route: '/client/order-management/templates'
      }
    ],
  },
  {
    title: 'Timesheets',
    icon: 'clock',
    route: '/client/time-sheets/all',
    count: 2,
    children: [
      {
        title: 'All Timesheets',
        icon: '',
        route: '/client/time-sheets/all'
      }
    ],
  },
  {
    title: 'Invoices',
    icon: 'dollar-sign',
    route: '/client/invoices/all',
    count: 6,
    children: [
      {
        title: 'All Invoices',
        icon: '',
        route: '/client/invoices/all'
      }
    ],
  },
  {
    title: 'Candidate List',
    icon: 'users',
    route: '/client/candidates',
    children: [],
  },
  {
    title: 'Reports',
    icon: 'clipboard',
    route: '/client/reports',
    children: [],
  }
];

export const SIDEBAR_CONFIG = {
  isDock: true,
  dockSize: '68px',
  width: '240px',
  type: 'Push'
}

export enum SortingDirections {
  Descending = 'Descending',
  Ascending = 'Ascending'
}

export const ORDERS_GRID_CONFIG = {
  initialRowsPerPage: 30,
  rowsPerPageDropDown: [ '30 Rows', '50 Rows', '100 Rows' ],
  isPagingEnabled: true,
  isSortingEnabled: true,
  isResizingEnabled: true,
  isWordWrappingEnabled: true,
  wordWrapSettings: { wrapMode: 'Content' } as TextWrapSettingsModel,
  gridHeight: '660',
  initialRowHeight: 64,
  resizeSettings: { mode:'Auto' } as ResizeSettingsModel,
  gridPageSettings: { pageSizes: true, pageSize: 30 },
  columns: [
    { field: 'orderId', direction: SortingDirections.Descending },
    { field: 'status', direction: SortingDirections.Descending },
    { field: 'jobTitle', direction: SortingDirections.Descending },
    { field: 'skill', direction: SortingDirections.Descending },
    { field: 'numberOfPosition', direction: SortingDirections.Descending },
    { field: 'location', direction: SortingDirections.Descending },
    { field: 'department', direction: SortingDirections.Descending },
    { field: 'type', direction: SortingDirections.Descending },
    { field: 'billRate', direction: SortingDirections.Descending },
    { field: 'candidates', direction: SortingDirections.Descending },
    { field: 'startDate', direction: SortingDirections.Descending }
  ]
}
