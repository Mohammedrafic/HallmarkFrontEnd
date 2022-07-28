import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

export interface NavigationTabModel {
  active?: OrganizationOrderManagementTabs | null;
  pending: OrganizationOrderManagementTabs | null;
}
