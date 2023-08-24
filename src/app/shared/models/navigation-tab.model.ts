import { OrderManagementIRPTabs, OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

export interface NavigationTabModel {
  active?: OrganizationOrderManagementTabs | OrderManagementIRPTabs | null;
  pending: OrganizationOrderManagementTabs | OrderManagementIRPTabs | null;
  current?: OrganizationOrderManagementTabs | OrderManagementIRPTabs | null;
}
