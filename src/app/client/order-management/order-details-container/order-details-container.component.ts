import { Component, Input, OnDestroy } from '@angular/core';

import { Order } from '@shared/models/order-management.model';
import { Subject } from 'rxjs';
import {OrderType} from "@shared/enums/order-type";

@Component({
  selector: 'app-order-details-container',
  templateUrl: './order-details-container.component.html',
  styleUrls: ['./order-details-container.component.scss']
})
export class OrderDetailsContainerComponent implements OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();
  public orderType = OrderType;

  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
