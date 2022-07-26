import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AgencyOrderManagement, Order, OrderManagement } from '@shared/models/order-management.model';
import {OrderType} from "@shared/enums/order-type";

@Component({
  selector: 'app-order-reorders-container',
  templateUrl: './order-reorders-container.component.html',
  styleUrls: ['./order-reorders-container.component.scss']
})
export class OrderReOrdersContainerComponent {
  public orderType = OrderType;

  public order: Order | OrderManagement | AgencyOrderManagement;
  @Input() set currentOrder(value: Order | OrderManagement | AgencyOrderManagement) {
    this.order = value;
  }
  @Input() isAgency: boolean = false;
  @Output() selectReOrder = new EventEmitter<{ reOrder: OrderManagement | AgencyOrderManagement, order: Order | OrderManagement | AgencyOrderManagement }>();
  @Output() editReorder = new EventEmitter<Order>();
}
