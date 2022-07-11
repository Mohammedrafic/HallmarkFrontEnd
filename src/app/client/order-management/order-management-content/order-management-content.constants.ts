export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64
}

export enum MoreMenuType {
  'Edit',
  'Duplicate',
  'Close',
  'Delete'
}

export enum OrderTypeName {
  ContractToPerm = 'ContractToPerm',
  OpenPerDiem = 'OpenPerDiem',
  PermPlacement = 'PermPlacement',
  Traveler = 'Traveler'
}

export enum OrderType {
  ContractToPerm = 0,
  OpenPerDiem = 1,
  PermPlacement = 2,
  Traveler = 3
}

export const ReOrdersColumnsConfig = [
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
    fieldName: 'id',
    visible: false
  },
  {
    fieldName: 'orderType',
    visible: false
  },
  {
    fieldName: 'startDate',
    visible: false
  }
];

export const AllOrdersColumnsConfig = [
  {
    fieldName: 'id',
    visible: true
  },
  {
    fieldName: 'orderType',
    visible: true
  },
  {
    fieldName: 'startDate',
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
