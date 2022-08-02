import { Component, Input } from '@angular/core';
import { AgencyOrder, AgencyOrderManagement, Order, OrderManagement } from '@shared/models/order-management.model';

@Component({
  selector: 'app-order-close-reason-info',
  templateUrl: './order-close-reason-info.component.html',
  styleUrls: ['../general-order-info/general-order-info.component.scss', './order-close-reason-info.component.scss']
})
export class OrderCloseReasonInfoComponent {
  @Input() orderInformation: Order | OrderManagement | AgencyOrderManagement;
}
