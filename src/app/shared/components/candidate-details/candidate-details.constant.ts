import { OrderType } from '@shared/enums/order-type';

export const OrderTypeOptionsForCandidates = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder, name: 'Re-Order' },
  { id: OrderType.Traveler, name: 'Traveler' },
];
