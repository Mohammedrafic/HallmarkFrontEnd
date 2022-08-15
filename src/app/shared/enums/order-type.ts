export enum OrderType {
  ContractToPerm,
  OpenPerDiem,
  PermPlacement,
  Traveler,
  ReOrder = 10,
}

export const OrderTypeTitlesMap = new Map([
  [OrderType.Traveler, 'Traveler'],
  [OrderType.OpenPerDiem, 'Per Diem'],
  [OrderType.ReOrder, 'Re-Order'],
  [OrderType.PermPlacement, 'Placement'],
  [OrderType.ContractToPerm, 'Contract To Perm'],
]);

export const OrderTypeOptions = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.Traveler, name: 'Traveler' },
];
