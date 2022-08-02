import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GetAgencyOrderCandidatesList } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Select, Store } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateListEvent, OrderCandidatesListPage } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { Observable, takeUntil } from 'rxjs';
import { OrderType } from '@shared/enums/order-type';
import { OrderManagementService } from '../order-management-content/order-management.service';

@Component({
  selector: 'app-order-candidates-container',
  templateUrl: './order-candidates-container.component.html',
  styleUrls: ['./order-candidates-container.component.scss'],
})
export class OrderCandidatesContainerComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
  }

  public orderCandidatePage: OrderCandidatesListPage;
  public orderCandidates: any;
  public orderType = OrderType;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  get excludeDeployed(): boolean {
    return this.orderManagementService.excludeDeployed;
  }

  constructor(private store: Store, private orderManagementService: OrderManagementService) {
    super();
  }

  ngOnInit(): void {
    this.orderCandidatePage$.pipe(takeUntil(this.destroy$)).subscribe((order) => {
      this.orderCandidatePage = order;
      this.orderCandidates = {
        isClosed: Boolean(this.order?.orderCloseDate) || Boolean(this.order?.orderClosureReasonId),
        orderId: this.order?.id,
        organizationId: this.order?.organizationId as number,
      };
    });
  }

  public onGetCandidatesList(event: CandidateListEvent): void {
    this.orderManagementService.excludeDeployed = event.excludeDeployed;
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        event.orderId,
        event.organizationId,
        event.currentPage,
        event.pageSize,
        event.excludeDeployed
      )
    );
  }
}
