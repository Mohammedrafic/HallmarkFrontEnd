import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { PurchaseOrderMapping, PurchaseOrderMappingPage, SavePurchaseOrderMappingDto, PurchaseOrderNames } from 'src/app/shared/models/purchase-order-mapping.model';
import {
  GetPurchaseOrderMappings, SavePurchaseOrderMapping, SavePurchaseOrderMappingSucceeded, SetIsDirtyPurchaseOrderMappingForm,
  DeletePurchaseOrderMappingSucceeded,
  ShowConfirmationPopUp,
  DeletePurchaseOrderMapping
} from './purchase-order-mapping.actions';
import { PurchaseOrderMappingService } from '@shared/services/purchase-order-mapping.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { RECORD_ADDED, RECORD_CANNOT_BE_SAVED, RECORD_CANNOT_BE_UPDATED, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

export interface PurchaseOrderMappingStateModel {
  purchaseOrderMappingPage: PurchaseOrderMappingPage | null;
  isPurchaseOrderMappingLoading: boolean,
  purchaseOrderMappingEntity: PurchaseOrderMapping | null;
  purchaseOrderNames: PurchaseOrderNames[];
}


@State<PurchaseOrderMappingStateModel>({
  name: 'purchaseOrderMappings',
  defaults: {
    purchaseOrderMappingPage: null,
    isPurchaseOrderMappingLoading: false,
    purchaseOrderMappingEntity: null,
    purchaseOrderNames: []
  },
})
@Injectable()
export class PurchaseOrderMappingState {

  @Selector()
  static purchaseOrderMappingPage(state: PurchaseOrderMappingStateModel): PurchaseOrderMappingPage | null {
    return state.purchaseOrderMappingPage;
  }

  @Selector()
  static isPurchaseOrderMappingLoading(state: PurchaseOrderMappingStateModel): boolean { return state.isPurchaseOrderMappingLoading; }

  @Selector()
  static purchaseOrderMappingEntity(state: PurchaseOrderMappingStateModel): PurchaseOrderMapping | null {
    return state.purchaseOrderMappingEntity;
  }

  @Selector()
  static purchaseOrderNames(state: PurchaseOrderMappingStateModel): PurchaseOrderNames[] {
    return state.purchaseOrderNames;
  }


  constructor(private purchaseOrderMappingService: PurchaseOrderMappingService) { }

  @Action(GetPurchaseOrderMappings)
  GetPurchaseOrderMappings({ patchState }: StateContext<PurchaseOrderMappingStateModel>, { filter }: GetPurchaseOrderMappings): Observable<PurchaseOrderMappingPage> {
    patchState({ isPurchaseOrderMappingLoading: true });
    return this.purchaseOrderMappingService.getPurchaseOrderMappings(filter).pipe(
      tap((payload) => {
        patchState({ isPurchaseOrderMappingLoading: false, purchaseOrderMappingPage: payload });
        return payload;
      })
    );
  }

  @Action(SavePurchaseOrderMapping)
  SavePurchaseOrderMapping(
    { dispatch }: StateContext<PurchaseOrderMappingStateModel>,
    { purchaseOrderMapping }: SavePurchaseOrderMapping
  ): Observable<SavePurchaseOrderMappingDto | void> {
    return this.purchaseOrderMappingService.savePurchaseOrderMapping(purchaseOrderMapping).pipe(
      tap((payloadResponse) => {
        dispatch([
          new ShowToast(MessageTypes.Success, purchaseOrderMapping.Id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
          new SavePurchaseOrderMappingSucceeded(),
          new SetIsDirtyPurchaseOrderMappingForm(false),
        ]);
        return payloadResponse;
      }),
      catchError((error: any) => {
        if (purchaseOrderMapping.Id) {
          if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
            return dispatch(new ShowConfirmationPopUp());
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, error && error?.error ? getAllErrors(error?.error) : RECORD_CANNOT_BE_UPDATED));
          }
        } else {
          if (error.error && error.error.errors && error.error.errors.ForceUpsert) {
            return dispatch(new ShowConfirmationPopUp());
          } else {
            return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED));
          }
        }
      })
    );
  }

  @Action(DeletePurchaseOrderMapping)
  DeletePurchaseOrderMapping({ patchState, dispatch }: StateContext<PurchaseOrderMappingStateModel>, { id }: DeletePurchaseOrderMapping): Observable<any> {
    patchState({ isPurchaseOrderMappingLoading: true });
    return this.purchaseOrderMappingService.removePurchaseOrderMapping(id).pipe(
      tap(() => {
        patchState({ isPurchaseOrderMappingLoading: false });
        const message = 'Purchase Order Mapping deleted successfully';
        const actions = [new DeletePurchaseOrderMappingSucceeded(), new ShowToast(MessageTypes.Success, message)];
        dispatch([...actions, new DeletePurchaseOrderMappingSucceeded()]);
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Purchase Order Mapping cannot be deleted'))))
    );
  }

}
