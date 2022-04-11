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
    icon: 'clock',
    route: '/client/order-management',
    children: [
      {
        title: 'All Orders',
        icon: '',
        route: 'all'
      },
      {
        title: 'Order Template',
        icon: '',
        route: 'templates'
      },
      {
        title: 'Incomplete',
        icon: '',
        route: 'incomplete'
      },
      {
        title: 'Pending Approval',
        icon: '',
        route: 'pending'
      }
    ],
  },
  {
    title: 'Timesheets',
    icon: 'users',
    route: '/client/time-sheets',
    children: [
      {
        title: 'All Timesheets',
        icon: '',
        route: 'all'
      },
      {
        title: 'Pending Approval',
        icon: '',
        route: 'pending'
      }
    ],
  },
  {
    title: 'Invoices',
    icon: 'dollar-sign',
    route: '/client/invoices',
    children: [
      {
        title: 'All Invoices',
        icon: '',
        route: 'all'
      },
      {
        title: 'Manual',
        icon: '',
        route: 'manual'
      },
      {
        title: 'Submitted',
        icon: '',
        route: 'submitted'
      },
      {
        title: 'Approval',
        icon: '',
        route: 'approval'
      },
      {
        title: 'Paid',
        icon: '',
        route: 'paid'
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
  },
];
