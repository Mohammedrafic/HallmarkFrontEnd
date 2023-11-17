import { formatDate } from '@angular/common';

import { ProfileStatusesEnum } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { IrpOrderCandidate } from '@shared/models/order-management.model';

export const CreateTooltipForOnHold = (data: IrpOrderCandidate[]) => {
  data.forEach((employee) => {
    employee.showOnHoldMessage = employee.profileStatus === ProfileStatusesEnum.OnHold;
    if (employee.showOnHoldMessage) {
      employee.onHoldMessage = `On Hold ${formatDate(employee.holdStartDate as string, 'MM/dd/yyyy', 'en-US', 'utc')}
      - ${formatDate(employee.holdEndDate as string, 'MM/dd/yyyy', 'en-US', 'utc')}`;
    }
  });
};
