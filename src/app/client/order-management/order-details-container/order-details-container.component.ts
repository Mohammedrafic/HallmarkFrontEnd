import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { OrderManagement } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { Subject, takeUntil } from 'rxjs';
import {OrderType} from "@shared/enums/order-type";

@Component({
  selector: 'app-order-details-container',
  templateUrl: './order-details-container.component.html',
  styleUrls: ['./order-details-container.component.scss']
})
export class OrderDetailsContainerComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();
  public orderType = OrderType;

  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.init();
  }

  constructor(private store: Store) {

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public init() : void {

  }
}
