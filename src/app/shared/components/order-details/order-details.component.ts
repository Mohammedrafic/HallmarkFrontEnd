import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { OrderManagement } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

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
