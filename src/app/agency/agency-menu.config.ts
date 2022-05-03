export const AGENCY_SIDEBAR_MENU = [
  {
    title: 'Dashboard',
    icon: 'home',
    route: '/agency/dashboard',
    children: [],
  },
  {
    title: 'Organization',
    icon: 'file-text',
    route: '/agency/organization',
    children: [],
  },
  {
    title: 'Agency',
    icon: 'clock',
    route: '/agency/agency-list',
    isActive: true,
    children: [
      {
        title: 'Agency List',
        icon: '',
        route: '/agency/agency-list'
      },
      {
        title: 'Candidates',
        icon: '',
        route: '/agency/candidates'
      },
    ],
  }
];
