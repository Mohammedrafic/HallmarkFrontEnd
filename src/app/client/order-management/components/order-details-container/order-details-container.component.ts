import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Order } from '@shared/models/order-management.model';
import { OrderType } from '@shared/enums/order-type';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { OrderStatus } from '@shared/enums/order-management';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { Comment } from '@shared/models/comment.model';

@Component({
  selector: 'app-order-details-container',
  templateUrl: './order-details-container.component.html',
  styleUrls: ['./order-details-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsContainerComponent {
  @Input() activeSystem: OrderManagementIRPSystemId;
  @Input() comments: Comment[] = [];
  @Input() CanOrganizationEditOrdersIRP: boolean;
  @Input() CanOrganizationViewOrdersIRP: boolean;
  public orderType = OrderType;
  public isClosedOrder = false;
  public readonly reasonClosure = {
    orderClosureReason: 'Candidate Rejected',
  } as Order;
  public order: Order;
  public showReasonInfo: boolean;

  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.showReasonInfo = !!(
      this.order?.extensionFromId &&
      this.order.candidates?.length &&
      this.order.candidates[0].status === CandidatStatus[CandidatStatus.Rejected]
    );
    this.setIsClosedOrder = this.order;
  }

  set setIsClosedOrder(order: Order) {
    this.isClosedOrder = order?.status === OrderStatus.Closed
    || !!order?.orderClosureReasonId || !!order?.orderClosureReason || !!order?.orderCloseDate;
  }

  public get orderInformation(): Order {
    return this.showReasonInfo ? this.reasonClosure : this.order;
  }
}
