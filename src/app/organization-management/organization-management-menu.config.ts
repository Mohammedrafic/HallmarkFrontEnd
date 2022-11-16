import { MenuSettings } from '@shared/models';

export const ORG_SETTINGS: MenuSettings[] = [
  { text: 'Regions', id: 11, route: './regions', permissionKey: 'CanViewOrganizationalHierarchy' },
  { text: 'Locations', id: 2, route: './locations', permissionKey: 'CanViewOrganizationalHierarchy' },
  { text: 'Departments', id: 1, route: './departments', permissionKey: 'CanViewOrganizationalHierarchy' },
  { text: 'Shifts', id: 5, route: './shifts', permissionKey: 'CanViewShifts' },
  { text: 'Skills', id: 3, route: './skills', permissionKey: 'CanViewAssignedSkills' },
  { text: 'Credentials', id: 4, route: './credentials', permissionKey: 'CanViewMasterCredentials' },
  { text: 'Holidays', id: 7, route: './holidays', permissionKey: 'CanViewOrganizationHolidays' },
  { text: 'Workflow', id: 8, route: './workflow', permissionKey: 'CanViewWorkflows' },
  { text: 'Bill Rates', id: 9, route: './bill-rates', permissionKey: 'CanViewSettingsBillRates' },
  { text: 'Configurations', id: 6, route: './settings', permissionKey: 'CanViewOrganizationSettings' },
  { text: 'Reasons', id: 10, route: './reasons', permissionKey: 'CanOrganizationViewOrders' },
  { text: 'Special Project', id: 12, route: './specialproject', permissionKey: 'CanViewSpecialProjects' },
  { text: 'Business Lines', id: 13, route: './businesslines' },
  { text: 'Tiers', id: 14, route: './tiers',  permissionKey: 'CanViewOrganizationTiers'}
];
