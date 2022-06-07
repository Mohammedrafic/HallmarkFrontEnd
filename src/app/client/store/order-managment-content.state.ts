import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GetIncompleteOrders, GetOrders } from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { OrderManagementPage } from '@shared/models/order-management.model';

export interface OrderManagementContentStateModel {
  orders: any;
  ordersPage: OrderManagementPage | null;
}

@State<OrderManagementContentStateModel>({
  name: 'orderManagement',
  defaults: {
    orders: null,
    ordersPage: null
  }
})
@Injectable()
export class OrderManagementContentState {
  @Selector()
  static orders(state: OrderManagementContentStateModel): any { return state.orders; }

  @Selector()
  static ordersPage(state: OrderManagementContentStateModel): any { return state.ordersPage; }

  constructor(private orderManagementService: OrderManagementContentService) {}

  @Action(GetIncompleteOrders)
  GetIncompleteOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetIncompleteOrders): Observable<any> {
    return this.orderManagementService.getIncompleteOrders(payload).pipe(tap((payload) => {
      patchState({ orders: payload });
    }));
  }

  @Action(GetOrders)
  GetOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { orderBy, pageNumber, pageSize }: GetOrders): Observable<OrderManagementPage> {
    return this.orderManagementService.getOrders(orderBy, pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ ordersPage: payload });
      return payload;
    }));
  }
}
