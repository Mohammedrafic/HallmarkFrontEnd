import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GetIncompleteOrders } from '@client/store/order-managment-content.actions';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';

export interface OrderManagementContentStateModel {
  orders: any;
}

@State<OrderManagementContentStateModel>({
  name: 'organizationManagement',
  defaults: {
    orders: null
  }
})
@Injectable()
export class OrderManagementContentState {
  @Selector()
  static orders(state: OrderManagementContentStateModel): any { return state.orders; }

  constructor(private organizationManagementService: OrderManagementContentService) {}

  @Action(GetIncompleteOrders)
  GetIncompleteOrders({ patchState }: StateContext<OrderManagementContentStateModel>, { payload }: GetIncompleteOrders): Observable<any> {
    return this.organizationManagementService.getIncompleteOrders(payload).pipe(tap((payload) => {
      patchState({ orders: payload });
    }));
  }
}
