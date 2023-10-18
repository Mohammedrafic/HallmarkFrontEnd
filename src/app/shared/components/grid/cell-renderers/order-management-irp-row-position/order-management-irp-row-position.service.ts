import { Injectable } from '@angular/core';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { CandidatesStatusText } from '@shared/enums/status';
import { IRPOrderPosition, Order } from '@shared/models/order-management.model';

import { Subject } from 'rxjs';


@Injectable()
export class OrderManagementIRPRowPositionService {
  public handleStatusClickEvent: Subject<{Order : Order, orderData:IRPOrderPosition, system : string}> = new Subject<{Order : Order,orderData : IRPOrderPosition, system : string}>();
  constructor() {
  }

  public HandleStatusChangeClick(Order: Order, orderData:IRPOrderPosition, system : string): void {
      orderData.candidateStatus = orderData.candidateStatusValue;
      this.handleStatusClickEvent.next({Order, orderData, system});
  }
 
}
