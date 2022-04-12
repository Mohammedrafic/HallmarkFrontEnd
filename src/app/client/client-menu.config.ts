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
        title: 'Order Template',
        icon: '',
        route: '/client/order-management/templates'
      },
      {
        title: 'Incomplete',
        icon: '',
        route: '/client/order-management/incomplete'
      },
      {
        title: 'Pending Approval',
        icon: '',
        route: '/client/order-management/pending'
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
      },
      {
        title: 'Pending Approval',
        icon: '',
        route: '/client/time-sheets/pending'
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
      },
      {
        title: 'Manual',
        icon: '',
        route: '/client/invoices/manual'
      },
      {
        title: 'Submitted',
        icon: '',
        route: '/client/invoices/submitted'
      },
      {
        title: 'Approval',
        icon: '',
        route: '/client/invoices/approval'
      },
      {
        title: 'Paid',
        icon: '',
        route: '/client/invoices/paid'
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
