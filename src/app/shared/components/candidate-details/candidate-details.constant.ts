import { OrderType } from '@shared/enums/order-type';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

export const OrderTypeOptionsForCandidates = [
  { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
  { id: OrderType.PermPlacement, name: 'Perm. Placement' },
  { id: OrderType.ReOrder, name: 'Re-Order' },
  { id: OrderType.Traveler, name: 'Traveler' },
];

export const ApplicantStatusOptionsForCandidates = [
  { id: ApplicantStatus.Cancelled, name: 'Cancelled' },
  { id: ApplicantStatus.Rejected, name: 'Rejected' },
  { id: ApplicantStatus.Withdraw, name: 'Withdraw' },
  { id: ApplicantStatus.Offboard, name: 'Offboard' },
  { id: ApplicantStatus.OnBoarded, name: 'Onboard' },
];

 
  
    