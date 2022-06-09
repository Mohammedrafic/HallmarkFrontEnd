import { OrderType } from "@shared/enums/order-type";
import { AgencyOrderManagement } from "@shared/models/order-management.model";

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64,
};

export const typeValueAccess = (_: string, { orderType }: AgencyOrderManagement) => {
  return OrderType[orderType];
};
