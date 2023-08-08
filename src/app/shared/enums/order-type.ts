export enum OrderType {
  ContractToPerm,
  OpenPerDiem,
  PermPlacement,
  LongTermAssignment,
  ReOrder = 10,
}

export enum IrpOrderType {
  LongTermAssignment = 3,
  PerDiem = 10,
}

export enum IrpOrderTypeforPayRate {
  PerDiem = 0,
  LongTermAssignment = 1,
}

export const IrpOrderTypeTooltipMessage: Record<number, string> = {
  [IrpOrderType.LongTermAssignment]: 'Long Term Assignment',
  [IrpOrderType.PerDiem]: 'Per Diem',
};

export const VmsOrderTypeTooltipMessage: Record<number, string> = {
  [OrderType.ContractToPerm]: 'Contract To Perm',
  [OrderType.OpenPerDiem]: 'Open Per Diem',
  [OrderType.PermPlacement]: 'Perm Placement',
  [OrderType.LongTermAssignment]: 'Long Term Assignment',
  [OrderType.ReOrder]: 'Re-Order',
};

export const OrderTypeTitlesMap = new Map([
  [OrderType.LongTermAssignment, 'LTA'],
  [OrderType.OpenPerDiem, 'Per Diem'],
  [OrderType.ReOrder, 'Re-Order'],
  [OrderType.PermPlacement, 'Placement'],
  [OrderType.ContractToPerm, 'Contract To Perm'],
]);

export const OrderTypeOptions = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.LongTermAssignment, name: 'LTA' },
  { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
];

export const PayrateOrderType = [
  { id: IrpOrderTypeforPayRate.LongTermAssignment, name: 'LTA' },
  { id: IrpOrderTypeforPayRate.PerDiem, name: 'Open Per Diem' },
];

export const IrpOrderTypes = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.OpenPerDiem, name: 'Per Diem' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder, name: 'Re-Order' },
  { id: OrderType.LongTermAssignment, name: 'LTA' },
];

export const FilterIrpOrderTypes = [
  { id: OrderType.ReOrder, name: 'Per Diem' },
  { id: OrderType.LongTermAssignment, name: 'LTA' },
];
