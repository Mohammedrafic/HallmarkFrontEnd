import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Select, Store } from "@ngxs/store";
import { Observable, takeUntil } from "rxjs";

import { OrderManagementState } from "@agency/store/order-management.state";
import { AgencyOrder, OrderCandidatesListPage } from "@shared/models/order-management.model";
import { Order } from "@shared/models/order-management.model";
import { CandidateListEvent } from '@shared/components/order-candidates-list/order-candidates-list.component';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GetAgencyOrderCandidatesList } from '@agency/store/order-management.actions';

@Component({
  selector: 'app-candidates-order',
  templateUrl: './order-candidates.component.html',
  styleUrls: ['./order-candidates.component.scss']
})
export class OrderCandidatesComponent extends DestroyableDirective implements OnInit {
  @Output() excludeDeployedEvent = new EventEmitter<boolean>();

  public orderCandidateInformation: Order;
  public orderCandidates: AgencyOrder;

  @Select(OrderManagementState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementState.orderCandidatesInformation)
  public orderCandidatesInformation$: Observable<Order>;

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOrderCandidates();
  }

  public onGetCandidatesList(event: CandidateListEvent): void {
    this.excludeDeployedEvent.emit(event.excludeDeployed);
    this.store.dispatch(
      new GetAgencyOrderCandidatesList(event.orderId, event.organizationId, event.currentPage, event.pageSize, event.excludeDeployed)
    );
  }

  private subscribeOnOrderCandidates(): void {
    this.orderCandidatesInformation$.pipe(takeUntil(this.destroy$)).subscribe((order) => {
      this.orderCandidateInformation = order;
      this.orderCandidates = {
        orderId: order?.id,
        organizationId: order?.organizationId as number
      }
    });
  }
}
