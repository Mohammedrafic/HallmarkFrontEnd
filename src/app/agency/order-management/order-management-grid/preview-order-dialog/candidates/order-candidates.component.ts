import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { OrderManagementState } from '@agency/store/order-management.state';
import { AgencyOrder, CandidateListEvent, OrderCandidatesListPage } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GetAgencyOrderCandidatesList } from '@agency/store/order-management.actions';
import { OrderType } from '@shared/enums/order-type';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import { OrderStatus } from '@shared/enums/order-management';
import { CandidateState } from '@agency/store/candidate.state';
import { OrderManagementPagerState } from '@shared/models/candidate.model';

@Component({
  selector: 'app-candidates-order',
  templateUrl: './order-candidates.component.html',
  styleUrls: ['./order-candidates.component.scss'],
})
export class OrderCandidatesComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() currentOrder: Order;
  public orderCandidates: AgencyOrder;
  public orderType = OrderType;
  public excludeDeployed = false;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.selectedOrder)
  public orderCandidatesInformation$: Observable<Order>;

  @Select(CandidateState.orderManagementPagerState)
  public orderManagementPagerState$: Observable<OrderManagementPagerState | null>;

  constructor(private store: Store, private orderManagementAgencyService: OrderManagementAgencyService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const order = changes['currentOrder']?.currentValue;

    if (order) {
      this.orderCandidates = {
        isClosed: order?.status === OrderStatus.Closed,
        orderId: order?.id,
        organizationId: order?.organizationId as number,
        isLocked: order?.isLocked as boolean,
      };
    }
  }

  ngOnInit(): void {
    this.excludeDeployed = this.orderManagementAgencyService.excludeDeployed;
  }

  public onGetCandidatesList(event: CandidateListEvent): void {
    this.orderManagementAgencyService.excludeDeployed = event.excludeDeployed;
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(
        event.orderId,
        event.organizationId,
        event.currentPage,
        event.pageSize,
        event.excludeDeployed,
        event.searchTerm,
      )
    );
  }
}
