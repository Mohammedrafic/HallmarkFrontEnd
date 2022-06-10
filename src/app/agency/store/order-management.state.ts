import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

import {
  AgencyOrderManagement,
  AgencyOrderManagementPage,
  OrderCandidatesListPage
} from '@shared/models/order-management.model';
import { Order } from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { getGroupedCredentials } from '@shared/components/order-details/order.utils';
import { Observable, tap } from 'rxjs';
import { GetAgencyOrderCandidatesList, GetAgencyOrderGeneralInformation, GetAgencyOrdersPage, GetOrderById } from './order-management.actions';

export interface OrderManagementModel {
  ordersPage: AgencyOrderManagementPage | null;
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderCandidatesInformation: Order | null;
  selectedOrder: Order | null;
  orderDialogOptions: DialogNextPreviousOption;
}

@State<OrderManagementModel>({
  name: 'agencyOrders',
  defaults: {
    ordersPage: null,
    orderCandidatesListPage: null,
    orderCandidatesInformation: null,
    selectedOrder: null,
    orderDialogOptions: {
      next: false,
      previous: false
    }
  },
})
@Injectable()
export class OrderManagementState {
  @Selector()
  static ordersPage(state: OrderManagementModel): AgencyOrderManagementPage | null {
    return state.ordersPage;
  }

  @Selector()
  static orderCandidatePage(state: OrderManagementModel): OrderCandidatesListPage | null {
    return state.orderCandidatesListPage;
  }

  @Selector()
  static orderCandidatesLenght(state: OrderManagementModel): number {
    return state.orderCandidatesListPage?.items.length || 0;
  }

  @Selector()
  static orderCandidatesInformation(state: OrderManagementModel): Order | null {
    return state.orderCandidatesInformation;
  }

  @Selector()
  static selectedOrder(state: OrderManagementModel): Order | null {
    return state.selectedOrder;
  }

  @Selector()
  static orderDialogOptions(state: OrderManagementModel): DialogNextPreviousOption {
    return state.orderDialogOptions;
  }

  @Selector()
  static lastSelectedOrder(state: OrderManagementModel): (id: number) => [AgencyOrderManagement, number] | [] {
    return (id: number) => {
      let rowIndex;
      const order = state.ordersPage?.items.find(({ orderId }, index) => {
        rowIndex = index; 
        return orderId === id;
      });
      return order && rowIndex ? [order, rowIndex] : [];
    };
  }

  constructor(private orderManagementContentService: OrderManagementContentService) {}

  @Action(GetAgencyOrdersPage)
  GetAgencyOrdersPage(
    { patchState }: StateContext<OrderManagementModel>,
    { pageNumber, pageSize }: GetAgencyOrdersPage
  ): Observable<AgencyOrderManagementPage> {
    return this.orderManagementContentService.getAgencyOrders(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ ordersPage: payload});
        return payload;
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementModel>,
    { orderId, organizationId, pageNumber, pageSize }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementContentService.getAgencyOrderCandidatesList(orderId,organizationId,pageNumber,pageSize).pipe(
      tap((payload) => {
        patchState({orderCandidatesListPage: payload});
        return payload
      })
    );
  }

  @Action(GetAgencyOrderGeneralInformation)
  GetAgencyOrderGeneralInformation(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId }: GetAgencyOrderGeneralInformation
  ): Observable<Order> {
    return this.orderManagementContentService.getAgencyOrderGeneralInformation(id, organizationId).pipe(
      tap((payload) => {
        patchState({orderCandidatesInformation: payload});
        return payload;
      })
    )
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementModel>,
    { id, organizationId, options }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options});
    return this.orderManagementContentService.getAgencyOrderById(id, organizationId).pipe(
      tap((payload) => {
        const groupedCredentials = getGroupedCredentials(payload.credentials)
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload});
        return payload;
      })
    );
  }
}
