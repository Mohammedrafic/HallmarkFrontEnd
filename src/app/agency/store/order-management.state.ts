import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { AgencyOrderManagementPage } from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { Observable, tap } from 'rxjs';
import { GetAgencyOrdersPage } from './order-management.actions';

const mockItems = {"items":[{"orderId":11,"statusText":"open","status":20,"jobTitle":"Order Org 4.1","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":2,"billRate":200.00,"candidates":15,"isLocked":true,"jobStartDate":"2023-01-01T00:00:00+02:00"},{"orderId":12,"statusText":"In Progress","status":30,"jobTitle":"Order Org 4.1","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":0,"billRate":200.00,"candidates":15,"isLocked":false,"jobStartDate":"2023-01-01T00:00:00+02:00"},{"orderId":15,"statusText":"Incomplete","status":1,"jobTitle":"Order Org 4.3","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":0,"billRate":200.00,"candidates":15,"isLocked":false,"jobStartDate":"2023-01-01T00:00:00+02:00"},{"orderId":13,"statusText":"Filled","status":50,"jobTitle":"Order Org 5.1","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":0,"billRate":200.00,"candidates":15,"isLocked":false,"jobStartDate":"2023-01-01T00:00:00+02:00"},{"orderId":14,"statusText":"Closed","status":60,"jobTitle":"Order Org 5.2","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":0,"billRate":200.00,"candidates":15,"isLocked":false,"jobStartDate":"2023-01-01T00:00:00+02:00"},{"orderId":16,"statusText":"In Progress Offer Pending","status":31,"jobTitle":"Order Org 5.3","skill":"NanoSurgery","location":"Ontario location","numberOfPositions":10,"department":"Dep Ontario","orderType":0,"billRate":200.00,"candidates":15,"isLocked":false,"jobStartDate":"2023-01-01T00:00:00+02:00"}],"pageNumber":1,"totalPages":1,"totalCount":6,"hasPreviousPage":false,"hasNextPage":false}

export interface OrderManagementModel {
  ordersPage: AgencyOrderManagementPage | null;
}

@State<OrderManagementModel>({
  name: 'agencyOrders',
  defaults: {
    ordersPage: null,
  },
})
@Injectable()
export class OrderManagementState {
  @Selector()
  static ordersPage(state: OrderManagementModel): AgencyOrderManagementPage | null {
    return state.ordersPage;
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
}
