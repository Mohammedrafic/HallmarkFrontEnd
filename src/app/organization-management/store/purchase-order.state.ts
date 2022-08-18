import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { PurchaseOrder, PurchaseOrderPage } from 'src/app/shared/models/purchase-order.model';
import {
    DeletPurchaseOrder,
  DeletPurchaseOrderSucceeded,
  GetPurchaseOrderById,
  GetPurchaseOrders, SavePurchaseOrder, SavePurchaseOrderSucceeded, SetIsDirtyPurchaseOrderForm
} from './purchase-order.actions';
import { PurchaseOrderService } from '@shared/services/purchase-order.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

export interface PurchaseOrderStateModel {
  purchaseOrderPage: PurchaseOrderPage | null;
  isPurchaseOrderLoading: boolean,
  PurchaseOrderEntity: PurchaseOrder | null;
}

@State<PurchaseOrderStateModel>({
  name: 'purchaseOrders',
  defaults: {
    purchaseOrderPage: null,
    isPurchaseOrderLoading: false,
    PurchaseOrderEntity:null
  }
})
@Injectable()
export class PurchaseOrderState {

  @Selector()
  static purchaseOrderPage(state: PurchaseOrderStateModel): PurchaseOrderPage | null {
    return state.purchaseOrderPage;
  }

  @Selector()
  static isPurchaseOrderLoading(state: PurchaseOrderStateModel): boolean { return state.isPurchaseOrderLoading; }

  @Selector()
  static purchaseOrderEntity(state: PurchaseOrderStateModel): PurchaseOrder | null {
    return state.PurchaseOrderEntity;
  }

  constructor(private purchaseOrderService: PurchaseOrderService) { }

  @Action(GetPurchaseOrders)
  getPurchaseOrders({ patchState }: StateContext<PurchaseOrderStateModel>, { }: GetPurchaseOrders): Observable<PurchaseOrderPage> {
    patchState({ isPurchaseOrderLoading: true });
    return this.purchaseOrderService.getPurchaseOrders().pipe(
      tap((payload) => {
        patchState({ isPurchaseOrderLoading: false, purchaseOrderPage: payload });
        return payload;
      })
    );
  }

  @Action(SavePurchaseOrder)
  savePurchaseOrder(
    { dispatch }: StateContext<PurchaseOrderStateModel>,
    { purchaseOrder }: SavePurchaseOrder
  ): Observable<PurchaseOrder | void> {
    return this.purchaseOrderService.savePurchaseOrder(purchaseOrder).pipe(
      tap((order) => {
        dispatch([
          new ShowToast(MessageTypes.Success, purchaseOrder.id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
          new SavePurchaseOrderSucceeded(),
          new SetIsDirtyPurchaseOrderForm(false),
        ]);
        return order;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }

  @Action(DeletPurchaseOrder)
  deletPurchaseOrder({ patchState, dispatch }: StateContext<PurchaseOrderStateModel>, { id }: DeletPurchaseOrder): Observable<any> {
    patchState({ isPurchaseOrderLoading: true });
    return this.purchaseOrderService.removePurchaseOrder(id).pipe(
      tap(() => {
        patchState({ isPurchaseOrderLoading: false });
        const message = 'Purchase order deleted successfully';
        const actions = [new DeletPurchaseOrderSucceeded(), new ShowToast(MessageTypes.Success, message)];
        dispatch([...actions, new DeletPurchaseOrderSucceeded()]);
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Purchase order cannot be deleted'))))
    );
  }

  @Action(GetPurchaseOrderById)
  getSpecialProjectsById({ patchState }: StateContext<PurchaseOrderStateModel>, { id }: GetPurchaseOrderById): Observable<PurchaseOrder> {
    return this.purchaseOrderService.getPurchaseOrderById(id).pipe(
      tap((payload) => {
        patchState({ PurchaseOrderEntity: payload });
      })
    );
  }
}
