import { MenuSettings } from '@shared/models';

export const ORG_SETTINGS: MenuSettings[] = [
  {
    text: 'Configurations',
    id: 1,
    route: './configurations',
    permissionKeys: ['CanViewAgencySettings'],
  },
];
