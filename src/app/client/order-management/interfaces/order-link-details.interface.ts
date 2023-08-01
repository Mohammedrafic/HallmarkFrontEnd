import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

export interface OrderLinkDetails {
  system: OrderManagementIRPSystemId;
  orderId?: string;
}

export interface OrderInfo {
  orderPublicId: string | number;
  candidateProfileId?: number;
  orderType?: number;
  organizationPrefix: string;
}
