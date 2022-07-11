import { OrderType } from '@shared/enums/order-type';
import { AgencyOrderManagement } from '@shared/models/order-management.model';
import { GridColumn } from '@shared/models/grid-column.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64,
};

export const typeValueAccess = (_: string, { orderType }: AgencyOrderManagement) => {
  return OrderType[orderType];
};

export const ReOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'reOrderId',
    visible: true
  },
  {
    fieldName: 'reOrderDate',
    visible: true
  },
  {
    fieldName: 'shift',
    visible: true
  },
  {
    fieldName: 'agencyName',
    visible: true
  },
  {
    fieldName: 'orderId',
    visible: false
  },
  {
    fieldName: 'type',
    visible: false
  },
  {
    fieldName: 'jobStartDate',
    visible: false
  },
  {
    fieldName: 'organizationName',
    visible: false
  }
];

export const MyAgencyOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'orderId',
    visible: true
  },
  {
    fieldName: 'type',
    visible: true
  },
  {
    fieldName: 'jobStartDate',
    visible: true
  },
  {
    fieldName: 'organizationName',
    visible: true
  },
  {
    fieldName: 'reOrderId',
    visible: false
  },
  {
    fieldName: 'reOrderDate',
    visible: false
  },
  {
    fieldName: 'shift',
    visible: false
  },
  {
    fieldName: 'agencyName',
    visible: false
  },
];
