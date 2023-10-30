import { EmployeeAction } from '../../../enums';
import { EmployeeButton, EmployeeServiceMethods } from '../../../interfaces';

export const ButtonsConfig = (): EmployeeButton[] => {
  return [
    {
      title: 'Reject Offer',
      type: EmployeeAction.RejectOffer,
      cssClass: 'e-outline'
    },
    {
      title: 'Accept Offer',
      type: EmployeeAction.AcceptOffer,
      cssClass: 'e-control e-btn e-lib e-primary'
    }
  ];
}

export const EmployeeActionEvent: Record<EmployeeAction, keyof EmployeeServiceMethods> = {
  [EmployeeAction.RejectOffer]: 'rejectEmployee',
  [EmployeeAction.AcceptOffer]: 'acceptEmployee',
}
