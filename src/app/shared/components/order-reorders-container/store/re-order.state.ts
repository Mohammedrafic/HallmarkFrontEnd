import { Injectable } from "@angular/core";

import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, tap } from 'rxjs';

import { GetReOrdersByOrderId } from "./re-order.actions";
import { ReOrderPage } from "../interfaces/re-order-state.interface";
import { ReOrderApiService } from "../services/re-order-api.service";
import { ReorderStateModel } from "../interfaces";


@State<ReorderStateModel>({
  name: 'reOrderState',
  defaults: {
    reOrderPage: null,
  },
})

@Injectable()
export class ReOrderState {
  constructor(private readonly reOrderApiService: ReOrderApiService) { }

  @Selector()
  static GetReOrdersByOrderId(state: ReorderStateModel): ReOrderPage | null {
    return state.reOrderPage;
  }

  @Action(GetReOrdersByOrderId)
  GetReOrdersByOrderId(
    { patchState }: StateContext<ReorderStateModel>,
    { orderId, pageNumber, pageSize, organizationId }: GetReOrdersByOrderId
  ): Observable<ReOrderPage> {
    return this.reOrderApiService.getReOrdersByOrderId(orderId, pageNumber, pageSize, organizationId)
      .pipe(
        tap((data) => {
          patchState({ reOrderPage: data });
        })
      );
  }
}
