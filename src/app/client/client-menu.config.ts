import { ClientSidebarMenu } from "../shared/models/client-sidebar-menu.model";

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
