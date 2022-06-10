import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GetAgencyOrderCandidatesList, GetIncompleteOrders, GetOrderById, GetOrders } from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { OrderCandidatesListPage, OrderManagementPage } from '@shared/models/order-management.model';
import { Order } from '@shared/models/organization.model';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

export interface OrderManagementContentStateModel {
  ordersPage: OrderManagementPage | null;
  selectedOrder: Order | null;
  orderCandidatesListPage: OrderCandidatesListPage | null;
  orderDialogOptions: {
    next: boolean,
    previous: boolean
  }
}

@State<OrderManagementContentStateModel>({
  name: 'orderManagement',
  defaults: {
    ordersPage: null,
    selectedOrder: null,
    orderCandidatesListPage: null,
    orderDialogOptions: {
      next: false,
      previous: false
    }
  }
})
@Injectable()
export class OrderManagementContentState {
  @Selector()
  static ordersPage(state: OrderManagementContentStateModel): OrderManagementPage | null { return state.ordersPage; }

  @Selector()
  static selectedOrder(state: OrderManagementContentStateModel): Order | null { return state.selectedOrder; }
  
  @Selector()
  static orderDialogOptions(state: OrderManagementContentStateModel): DialogNextPreviousOption {
    return state.orderDialogOptions;
  }

  @Selector()
  static orderCandidatePage(state: OrderManagementContentStateModel): OrderCandidatesListPage | null {
    return state.orderCandidatesListPage;
  }

  constructor(private orderManagementService: OrderManagementContentService) {}

  @Action(GetIncompleteOrders)
  GetIncompleteOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetIncompleteOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getIncompleteOrders(payload).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
    }));
  }

  @Action(GetOrders)
  GetOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getOrders(payload).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
      return payload;
    }));
  }

  @Action(GetOrderById)
  GetOrderById(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { id, options, organizationId }: GetOrderById
  ): Observable<Order> {
    patchState({ orderDialogOptions: options});
    return this.orderManagementService.getOrderById(id).pipe(
      tap((payload) => {
        const groupedCredentials = payload.credentials.reduce((rv, x) => {
          (rv[x['credentialType']] = rv[x['credentialTypeId']] || []).push(x);
          return rv;
        }, {});
        payload.groupedCredentials = groupedCredentials;
        patchState({ selectedOrder: payload});
        return payload;
      })
    );
  }

  @Action(GetAgencyOrderCandidatesList)
  GetAgencyOrderCandidatesPage(
    { patchState }: StateContext<OrderManagementContentStateModel>,
    { orderId, organizationId, pageNumber, pageSize }: GetAgencyOrderCandidatesList
  ): Observable<OrderCandidatesListPage> {
    return this.orderManagementService.getAgencyOrderCandidatesList(orderId,organizationId,pageNumber,pageSize).pipe(
      tap((payload) => {
        patchState({orderCandidatesListPage: payload});
        return payload
      })
    );
  }
}
