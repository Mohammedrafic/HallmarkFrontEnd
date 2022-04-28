export const ADMIN_SIDEBAR_MENU = [
  {
    title: 'Dashboard',
    icon: 'home',
    route: '/admin/dashboard',
    children: []
  },
  {
    title: 'Org Management',
    icon: 'file-text',
    route: '/admin/organization-management',
    isActive: true,
    children: [
      {
        title: 'Config and Settings',
        icon: '',
        route: '/admin/organization-management'
      }
    ],
  },
  {
    title: 'Client Management',
    icon: 'file-text',
    route: '/admin/client-management',
    children: [],
  }
];
