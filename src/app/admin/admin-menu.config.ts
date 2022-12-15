import { MenuSettings } from '@shared/models';

export const MASTER_DATA_CONFIG: MenuSettings[] = [
  { text: 'Skills', id: 1, route: './skills' },
  { text: 'Credentials', id: 2, route: './credentials', permissionKeys: ['CanViewMasterCredentials'] },
  { text: 'Holidays', id: 3, route: './holidays', permissionKeys: ['CanViewMasterHolidays'] },
  { text: 'Reasons for Rejection', id: 4, route: './reject-reason', permissionKeys: ['CanOrganizationViewOrders'] },
  { text: 'Manual invoice reasons', id: 5, route: './manual-invoice-reasons'},
];
