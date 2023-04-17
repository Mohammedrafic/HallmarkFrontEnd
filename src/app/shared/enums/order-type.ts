export enum OrderType {
  ContractToPerm,
  OpenPerDiem,
  PermPlacement,
  Traveler,
  ReOrder = 10,
}

export enum IrpOrderType {
  LongTermAssignment = 3,
  PerDiem = 10
}

export enum IrpOrderTypeforPayRate {
  PerDiem = 0,
  LongTermAssignment = 1,
}

export const OrderTypeTitlesMap = new Map([
  [OrderType.Traveler, 'Traveler'],
  [OrderType.OpenPerDiem, 'Per Diem'],
  [OrderType.ReOrder, 'Re-Order'],
  [OrderType.PermPlacement, 'Placement'],
  [OrderType.ContractToPerm, 'Contract To Perm'],
]);

export const OrderTypeOptions = [
  { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
  { id: OrderType.Traveler, name: 'Traveler' }
];

export const PayrateOrderType = [
  { id: IrpOrderTypeforPayRate.LongTermAssignment, name: 'LTA' },
  { id: IrpOrderTypeforPayRate.PerDiem, name: 'Open Per Diem' }
]

export const IrpOrderTypes = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.OpenPerDiem, name: 'Per Diem' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder,name: 'Re-Order' },
  { id: OrderType.Traveler, name: 'LTA' },
];

export const FilterIrpOrderTypes = [
  { id: OrderType.ReOrder, name: 'Per Diem' },
  { id: OrderType.Traveler, name: 'LTA' },
];
