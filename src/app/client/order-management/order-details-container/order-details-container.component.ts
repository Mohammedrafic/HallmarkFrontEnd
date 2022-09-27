import { Component, Input } from '@angular/core';

import { Order, OrderManagementChild } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-order-details-container',
  templateUrl: './order-details-container.component.html',
  styleUrls: ['./order-details-container.component.scss'],
})
export class OrderDetailsContainerComponent {
  public orderType = OrderType;
  public readonly reasonClosure = {
    positionClosureReason: 'Candidate Rejected',
  } as OrderManagementChild;
  public order: Order;
  public showReasonInfo: boolean;

  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.showReasonInfo = !!(
      this.order?.extensionFromId &&
      this.order.candidates?.length &&
      this.order.candidates[0].status === CandidatStatus[CandidatStatus.Rejected]
    );
  }
}
