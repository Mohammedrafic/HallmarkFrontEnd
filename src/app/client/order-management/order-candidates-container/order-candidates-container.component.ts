import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Select, Store } from '@ngxs/store';
import { OrderCandidatesListPage, OrderManagement } from '@shared/models/order-management.model';
import { Order } from '@shared/models/organization.model';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-candidates-container',
  templateUrl: './order-candidates-container.component.html',
  styleUrls: ['./order-candidates-container.component.scss']
})
export class OrderCandidatesContainerComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject();

  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
    this.init();
  }

  public orderCandidatePage: OrderCandidatesListPage;
  public orderCandidates: any;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  constructor(private store: Store) {
   
  }

  ngOnInit(): void {
    this.orderCandidatePage$.pipe(takeUntil((this.unsubscribe$))).subscribe((order) => {
      this.orderCandidatePage = order;
      this.orderCandidates = {
        orderId: this.order.id,
        organizationId: this.order.organizationId as number
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public init() : void {

  }
}
