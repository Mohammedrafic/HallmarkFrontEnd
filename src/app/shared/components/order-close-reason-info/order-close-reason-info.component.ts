import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  AgencyOrderManagement,
  Order,
  OrderCandidateJob,
  OrderManagement,
  OrderManagementChild,
} from '@shared/models/order-management.model';

@Component({
  selector: 'app-order-close-reason-info',
  templateUrl: './order-close-reason-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss', './order-close-reason-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCloseReasonInfoComponent {
  @Input() orderInformation: Order | OrderManagement | AgencyOrderManagement;
  @Input() candidate: OrderManagementChild | OrderCandidateJob;
  @Input() showCloseData = true;
  private readonly autoClosedReason = 'Job Completed';

  get closeReason(): string {
    return this.candidate?.positionClosureReason || this.orderInformation?.orderClosureReason || this.autoClosedReason;
  }

  get closeDate(): string {
    return this.candidate?.closeDate || (this.orderInformation?.orderCloseDate as string);
  }

  get showCloseDate(): boolean {
    return !this.candidate?.positionClosureReason && !this.orderInformation?.orderClosureReason ? false : this.showCloseData;
  }
}
