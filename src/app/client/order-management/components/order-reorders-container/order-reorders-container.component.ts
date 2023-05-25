import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AgencyOrderManagement, Order, OrderManagement, ReOrderPage } from '@shared/models/order-management.model';
import {OrderType} from '@shared/enums/order-type';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-order-reorders-container',
  templateUrl: './order-reorders-container.component.html',
  styleUrls: ['./order-reorders-container.component.scss'],
})
export class OrderReOrdersContainerComponent {
  @Input() set currentOrder(value: Order | OrderManagement | AgencyOrderManagement) {
    this.order = value;
  }
  @Input() isAgency = false;

  @Input() activeSystem: OrderManagementIRPSystemId = OrderManagementIRPSystemId.VMS;

  @Input() reOrders: ReOrderPage | null;

  @Output() selectReOrder = new EventEmitter<{ reOrder: OrderManagement | AgencyOrderManagement, order: Order
    | OrderManagement | AgencyOrderManagement }>();

  @Output() editReorder = new EventEmitter<Order>();

  public orderType = OrderType;

  public order: Order | OrderManagement | AgencyOrderManagement;
}
