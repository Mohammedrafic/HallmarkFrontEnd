import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { GetAgencyOrderCandidatesList, GetIrpOrderCandidates } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Select, Store } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateListEvent, OrderCandidatesListPage, Order,
  IrpOrderCandidate } from '@shared/models/order-management.model';
import { Observable, takeUntil } from 'rxjs';
import { OrderType } from '@shared/enums/order-type';
import { OrderManagementService } from '../order-management-content/order-management.service';
import { OrderStatus } from '@shared/enums/order-management';
import { PageOfCollections } from '@shared/models/page.model';

@Component({
  selector: 'app-order-candidates-container',
  templateUrl: './order-candidates-container.component.html',
  styleUrls: ['./order-candidates-container.component.scss'],
})
export class OrderCandidatesContainerComponent extends DestroyableDirective implements OnInit, OnChanges, OnDestroy {
  public order: Order;
  @Input() set currentOrder(value: Order) {
    this.order = value;
  }

  public orderCandidatePage: OrderCandidatesListPage;
  public orderCandidates: any;
  public orderType = OrderType;

  @Select(OrderManagementContentState.orderCandidatePage)
  public orderCandidatePage$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.getIrpCandidates)
  public irpCandidates$: Observable<PageOfCollections<IrpOrderCandidate>>;

  get excludeDeployed(): boolean {
    return this.orderManagementService.excludeDeployed;
  }

  constructor(private store: Store, private orderManagementService: OrderManagementService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const order = changes['currentOrder']?.currentValue;

    if (order) {
      this.orderCandidates = {
        isClosed: order?.status === OrderStatus.Closed,
        orderId: order?.id,
        organizationId: order?.organizationId as number,
      };
    }
  }

  ngOnInit(): void {
    this.orderCandidatePage$.pipe(takeUntil(this.destroy$)).subscribe((order) => {
      this.orderCandidatePage = order;
    });
  }

  public onGetCandidatesList(event: CandidateListEvent): void {
    this.orderManagementService.excludeDeployed = event.excludeDeployed;
    const Action = this.order.irpOrderMetadata ? GetIrpOrderCandidates : GetAgencyOrderCandidatesList;

    this.store.dispatch(
      new Action(
        event.orderId,
        event.organizationId,
        event.currentPage,
        event.pageSize,
        event.excludeDeployed
      )
    );
  }
}
