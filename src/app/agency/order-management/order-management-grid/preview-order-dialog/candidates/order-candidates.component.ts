import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';

import { OrderManagementState } from '@agency/store/order-management.state';
import { AgencyOrder, CandidateListEvent, OrderCandidatesListPage } from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GetAgencyOrderCandidatesList } from '@agency/store/order-management.actions';
import { OrderType } from '@shared/enums/order-type';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';

@Component({
  selector: 'app-candidates-order',
  templateUrl: './order-candidates.component.html',
  styleUrls: ['./order-candidates.component.scss'],
})
export class OrderCandidatesComponent extends DestroyableDirective implements OnInit {
  public orderCandidateInformation: Order;
  public orderCandidates: AgencyOrder;
  public orderType = OrderType;
  public excludeDeployed = false;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.orderCandidatesInformation)
  public orderCandidatesInformation$: Observable<Order>;

  constructor(private store: Store, private orderManagementAgencyService: OrderManagementAgencyService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOrderCandidates();
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
        event.excludeDeployed
      )
    );
  }

  private subscribeOnOrderCandidates(): void {
    this.orderCandidatesInformation$.pipe(takeUntil(this.destroy$)).subscribe((order) => {
      this.orderCandidateInformation = order;
      this.orderCandidates = {
        orderId: order?.id,
        organizationId: order?.organizationId as number,
        isLocked: order?.isLocked as boolean,
        isClosed: Boolean(order?.orderCloseDate) || Boolean(order?.orderClosureReason),
      };
    });
  }
}

