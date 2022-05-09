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
    route: '/admin/client-management',
    isActive: true,
    children: [
      {
        title: 'Organization List',
        icon: '',
        route: '/admin/client-management',
      },
      {
        title: 'Config and Settings',
        icon: '',
        route: '/admin/organization-management'
      }
    ],
  },
  {
    title: 'Master Data',
    icon: 'user',
    route: '/admin/master-data',
    children: []
  },
];

export const MASTER_DATA_CONFIG: { [key: string]: Object }[] = [
  { text: 'Skills', id: 1, route: 'admin/master-data/skills' },
  { text: 'Credential Types', id: 2, route: 'admin/master-data/credential-types' },
  { text: 'Holidays', id: 3, route: 'admin/master-data/skills' }
];

export const ORG_SETTINGS: { [key: string]: Object }[] = [
  { text: 'Locations', id: 2, route: 'admin/organization-management/locations' },
  { text: 'Departments', id: 1, route: 'admin/organization-management/departments' },
  { text: 'Skills', id: 3, route: 'admin/organization-management/skills'},
  { text: 'Credentials', id: 4, route: 'admin/organization-management/credentials' }
];
