import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { DeleteBillRatesById, GetBillRates, SaveUpdateBillRate } from '@organization-management/store/bill-rates.actions';
import { BillRatesService } from '@shared/services/bill-rates.service';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';

export interface BillRatesStateModel {
  billRatesPage: any
}

@State<BillRatesStateModel>({
  name: 'billrates',
  defaults: {
    billRatesPage: null
  }
})
@Injectable()
export class BillRatesState {

  @Selector()
  static billRatesPage(state: BillRatesStateModel): any { return state.billRatesPage; }

  constructor(private billRatesService: BillRatesService) {}

  @Action(GetBillRates)
  GetBillRates({ patchState }: StateContext<BillRatesStateModel>, { }: GetBillRates): Observable<any> {
    return this.billRatesService.getBillRates().pipe(tap((payload) => {
      patchState({ billRatesPage: payload });
      return payload;
    }));
  }

  @Action(SaveUpdateBillRate)
  SaveUpdateBillRate({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload }: SaveUpdateBillRate): Observable<any> {
    return this.billRatesService.saveUpdateBillRate(payload)
      .pipe(tap((payloadResponse) => {
          if (payload.id) {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          } else {
            dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          }
          dispatch(new GetBillRates());
          return payloadResponse;
        }),
        catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
      );
  }

  @Action(DeleteBillRatesById)
  DeleteBillRatesById({ patchState, dispatch }: StateContext<BillRatesStateModel>, { payload }: DeleteBillRatesById): Observable<any> {
    return this.billRatesService.removeBillRateById(payload).pipe(tap(() => {
        dispatch(new GetBillRates());
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }
}
