import { Component, Input } from '@angular/core';
import { AgencyOrderManagement, Order, OrderManagement, OrderManagementChild } from '@shared/models/order-management.model';

@Component({
  selector: 'app-order-close-reason-info',
  templateUrl: './order-close-reason-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss', './order-close-reason-info.component.scss']
})
export class OrderCloseReasonInfoComponent {
  @Input() orderInformation: Order | OrderManagement | AgencyOrderManagement;
  @Input() candidate: OrderManagementChild;

  get closeReason(): string {
    return this.candidate?.positionClosureReason || this.orderInformation?.orderClosureReason as string;
  }

  get closeDate(): string {
    return this.candidate?.closeDate || this.orderInformation?.orderCloseDate as string;
  }
}
