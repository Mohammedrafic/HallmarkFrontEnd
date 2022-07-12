import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GetAgencyOrderCandidatesList } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Select, Store } from '@ngxs/store';
import { CandidateListEvent } from '@shared/components/order-candidates-list/order-candidates-list.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderCandidatesListPage } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-candidates-container',
  templateUrl: './order-candidates-container.component.html',
  styleUrls: ['./order-candidates-container.component.scss']
})
export class OrderCandidatesContainerComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
  }

  public orderCandidatePage: OrderCandidatesListPage;
  public orderCandidates: any;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.orderCandidatePage$.pipe(takeUntil((this.destroy$))).subscribe((order) => {
      this.orderCandidatePage = order;
      this.orderCandidates = {
        orderId: this.order.id,
        organizationId: this.order.organizationId as number
      }
    });
  }

  public onGetCandidatesList(event: CandidateListEvent) : void {
    this.store.dispatch(new GetAgencyOrderCandidatesList(event.orderId, event.organizationId, event.currentPage, event.pageSize, event.includeDeployedCandidates));
  }
}
