import { MenuSettings } from '@shared/models';

export const ORG_SETTINGS: MenuSettings[] = [
  {
    text: 'Regions',
    id: 11,
    route: './regions',
    permissionKeys: ['CanViewOrganizationalHierarchy', 'CanCreateOrders'],
  },
  {
    text: 'Locations',
    id: 2,
    route: './locations',
    permissionKeys: ['CanViewOrganizationalHierarchy', 'CanCreateOrders'],
  },
  {
    text: 'Departments',
    id: 1,
    route: './departments',
    permissionKeys: ['CanViewOrganizationalHierarchy', 'CanCreateOrders'],
  },
  { text: 'Shifts', id: 5, route: './shifts', permissionKeys: ['CanViewShifts'] },
  { text: 'Skills', id: 3, route: './skills', permissionKeys: ['CanViewAssignedSkills'] },
  { text: 'Credentials', id: 4, route: './credentials', permissionKeys: ['CanViewMasterCredentials'] },
  { text: 'Holidays', id: 7, route: './holidays', permissionKeys: ['CanViewOrganizationHolidays'] },
  { text: 'Workflow', id: 8, route: './workflow', permissionKeys: ['CanViewWorkflows'] },
  { text: 'Bill Rates', id: 9, route: './bill-rates', permissionKeys: ['CanViewSettingsBillRates'] },
  { text: 'Configurations', id: 6, route: './settings', permissionKeys: ['CanViewOrganizationSettings'] },
  { text: 'Reasons', id: 10, route: './reasons', permissionKeys: ['CanOrganizationViewOrders'] },
  { text: 'Special Project', id: 12, route: './specialproject', permissionKeys: ['CanViewSpecialProjects'] },
  { text: 'Business Lines', id: 13, route: './businesslines' },
  { text: 'Tiers', id: 14, route: './tiers', permissionKeys: ['CanViewOrganizationTiers'] },
  {
    text: 'Work Commitment',
    id: 15,
    route: './workcommitment',
    permissionKeys: ['CanViewWorkCommitmentData'],
    isIRPOnly: true,
  },
  {
    text: 'Orientation',
    id: 16,
    route: './orientation',
    permissionKeys: ['CanViewOrientation'],
    isIRPOnly: true,
  },
];
