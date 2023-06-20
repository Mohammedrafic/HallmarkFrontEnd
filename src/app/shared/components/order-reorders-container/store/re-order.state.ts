import { Injectable } from "@angular/core";

import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, tap } from 'rxjs';

import { GetReOrdersByOrderId, SaveReOrderPageSettings } from "./re-order.actions";
import { ReOrderPage } from "../interfaces/re-order-state.interface";
import { ReOrderApiService } from "../services/re-order-api.service";
import { PageSettings, ReorderStateModel } from "../interfaces";


@State<ReorderStateModel>({
  name: 'reOrderState',
  defaults: {
    reOrderPage: null,
    pageSettings: {
      pageNumber: 1,
      pageSize: 100,
      refreshPager: false,
    },
  },
})

@Injectable()
export class ReOrderState {
  constructor(private readonly reOrderApiService: ReOrderApiService) { }

  @Selector()
  static GetReOrdersByOrderId(state: ReorderStateModel): ReOrderPage | null {
    return state.reOrderPage;
  }

  @Selector()
  static GetReOrderPageSettings(state: ReorderStateModel): PageSettings {
    return state.pageSettings;
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

  @Action(SaveReOrderPageSettings)
  SaveReOrderPageSettings(
    { patchState }: StateContext<ReorderStateModel>,
    { pageNumber, pageSize, refreshPager }: SaveReOrderPageSettings
  ): void {
    patchState({ pageSettings: { pageNumber, pageSize, refreshPager} });
  }
}
